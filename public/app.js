let API_URL = "";

async function loadEnv() {
    const response = await fetch("/env");
    if (!response.ok) throw new Error("Failed to load environment variables");
    const env = await response.json();
    API_URL = env.API_URL;
}

await loadEnv();

async function cargarRequerimientos() {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.requerimientos;
}

async function guardarRequerimiento(requerimiento) {
    const confirmar = window.confirm("¿Deseas guardar este nuevo requerimiento?");
    if (!confirmar) {
        return;
    } else {
        location.reload();
    }

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requerimiento),
    });

    mostrarAlerta("Requerimiento guardado exitosamente", "success");
}

async function eliminarRequerimiento(id) {
    const confirmar = window.confirm("¿Estás seguro de eliminar este requerimiento?");
    if (!confirmar) {
        return;
    } else {
        location.reload();
    }

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    mostrarAlerta("Requerimiento eliminado correctamente", "danger");
}

async function exportarPDF(id) {
    try {
        const cargarLogo = async () => {
            const response = await fetch('./logo.png');
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        };

        const logo = await cargarLogo();

        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el requerimiento.");
        const requerimiento = await response.json();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const pageHeight = 297;
        const marginTop = 20;
        const marginBottom = 30;
        const lineHeight = 10;
        const contentHeight = pageHeight - marginTop - marginBottom;

        let currentY = marginTop;

        const agregarEncabezado = () => {
            pdf.setFillColor(195, 181, 155);
            pdf.rect(0, 0, 210, marginTop, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detalles del Requerimiento", 105, 15, { align: "center" });
            pdf.addImage(logo, "PNG", 10, 5, 70, 15);

            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);

            currentY = marginTop + 10;
        };

        const verificarSaltoPagina = (neededHeight) => {
            if (currentY + neededHeight > contentHeight) {
                pdf.addPage();
                agregarEncabezado();
            }
        };

        agregarEncabezado();

        const datos = [
            ["ID", String(requerimiento.id)],
            ["Título", requerimiento.titulo || "N/A"],
            ["Descripción", requerimiento.descripcion || "N/A"],
            ["Horas Estimadas", String(requerimiento.estimado || 0)],
            ["Usuario Asignado", requerimiento.usuario || "No asignado"],
            ["Área", requerimiento.area || "Sin área"],
            ["Estado", requerimiento.estado || "Indefinido"],
            ["Fecha de Inicio", requerimiento.fechaInicio || "No definida"],
            ["Fecha de Cierre", requerimiento.fechaCierre || "No definida"]
        ];

        datos.forEach(([key, value]) => {
            const estimatedHeight = lineHeight;
            verificarSaltoPagina(estimatedHeight);

            pdf.setFont("helvetica", "bold");
            pdf.text(`${key}:`, 10, currentY);

            pdf.setFont("helvetica", "normal");
            const text = key === "Descripción" ? pdf.splitTextToSize(String(value), 150) : [String(value)];
            pdf.text(text, 50, currentY);

            currentY += lineHeight + (text.length - 1) * 5;
        });

        let totalAdditionalHours = 0;
        if (requerimiento.puntosDeControl && requerimiento.puntosDeControl.length > 0) {
            verificarSaltoPagina(lineHeight);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("Puntos de Control", 10, currentY);
            currentY += lineHeight;

            requerimiento.puntosDeControl.forEach((pdc, index) => {
                verificarSaltoPagina(lineHeight * 5);

                pdf.setFont("helvetica", "bold");
                pdf.text(`PDC ${index + 1}:`, 10, currentY);

                pdf.setFont("helvetica", "normal");
                currentY += lineHeight;

                pdf.text(`Fecha: ${pdc.fecha}`, 20, currentY);
                currentY += lineHeight;

                const descripcion = pdf.splitTextToSize(`Descripción: ${pdc.descripcion}`, 170);
                pdf.text(descripcion, 20, currentY);
                currentY += descripcion.length * 5 + lineHeight;

                if (pdc.horasAdicionales) {
                    totalAdditionalHours += parseInt(pdc.horasAdicionales, 10) || 0;
                    pdf.text(`Horas Adicionales: ${pdc.horasAdicionales}`, 20, currentY);
                    currentY += lineHeight;
                }
                if (pdc.nuevaFecha) {
                    pdf.text(`Nueva Fecha: ${pdc.nuevaFecha}`, 20, currentY);
                    currentY += lineHeight;
                }
            });
        }

        const totalEstimatedHours = parseInt(requerimiento.estimado, 10) || 0;
        const totalHours = totalEstimatedHours + totalAdditionalHours;

        verificarSaltoPagina(lineHeight * 3);
        pdf.setFont("helvetica", "bold");
        pdf.text("Resumen de Horas", 10, currentY);

        pdf.setFont("helvetica", "normal");
        pdf.text(`Horas Estimadas: ${totalEstimatedHours}`, 10, currentY + 10);
        pdf.text(`Horas Adicionales: ${totalAdditionalHours}`, 10, currentY + 20);
        pdf.text(`Total de Horas: ${totalHours}`, 10, currentY + 30);

        pdf.save(`requerimiento_${requerimiento.id}.pdf`);
    } catch (error) {
        console.error("Error al exportar a PDF:", error);
        alert("No se pudo exportar el requerimiento a PDF.");
    }
}

window.exportarPDF = exportarPDF;

async function init() {
    const requerimientos = await cargarRequerimientos();
    const list = document.getElementById("requerimientos-list");

    list.innerHTML = "";
    const today = new Date().toISOString().split("T")[0];

    requerimientos.forEach((req) => {
        const fechaCierre = req.fechaCierre ? new Date(req.fechaCierre) : null;
        const isExpired = fechaCierre && fechaCierre < new Date(today);
        const isCulminado = req.estado === "Completado" && fechaCierre && fechaCierre <= new Date(today);
        const isInProccess = req.estado === "En Proceso";

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <strong>${req.titulo}</strong> - ${req.estado}
                ${isCulminado ? '<span class="badge bg-success text-light ms-2">Culminado</span>' : isExpired ? '<span class="badge bg-danger ms-2">Vencido</span>' : isInProccess ? '<span class="badge bg-primary ms-2">En Proceso</span>' : ""}
                <br>
                <small>Área: ${req.area}</small>
            </div>
            <div style="
                display: flex;
                gap: 10px;
                justify-content: center;
                align-items: inherit;
			">
                <a href="edit.html?id=${req.id}" class="btn btn-primary btn-sm" style="color: white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
                    </svg>
				</a>
                <button class="btn btn-success btn-sm" onclick="exportarPDF(${req.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                </svg>
				</button>
                <button class="btn btn-danger btn-sm" onclick="eliminar(${req.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>
				</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function eliminar(id) {
    const confirmar = window.confirm("¿Estás seguro de eliminar este requerimiento?");
    if (!confirmar) return;

    eliminarRequerimiento(id).then(() => location.reload());
    if (eliminarRequerimiento) {
        mostrarAlerta("Punto de Control eliminado correctamente", "danger");
    }
}

document.getElementById("requerimiento-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const tituloElem = document.getElementById("titulo");
    const descripcionElem = document.getElementById("descripcion");
    const estimadoElem = document.getElementById("estimado");
    const usuarioElem = document.getElementById("usuario");
    const areaElem = document.getElementById("area");
    const fechaInicioElem = document.getElementById("fechaInicio");

    if (!tituloElem || !descripcionElem || !estimadoElem || !usuarioElem || !areaElem || !fechaInicioElem) {
        console.error("Uno o más elementos del formulario no están definidos.");
        return;
    }

    const titulo = tituloElem.value;
    const descripcion = descripcionElem.value;
    const estimado = estimadoElem.value;
    const usuario = usuarioElem.value;
    const area = areaElem.value;
    const fechaInicio = fechaInicioElem.value || new Date().toLocaleDateString();

    if (!titulo || !estimado || !usuario || !area) {
        console.error("Faltan campos obligatorios.");
        return;
    }

    const nuevoRequerimiento = {
        id: Date.now(),
        titulo,
        descripcion,
        estimado,
        usuario,
        area,
        estado: "Pendiente",
        fechaInicio,
        fechaCierre: null,
    };

    await guardarRequerimiento(nuevoRequerimiento);
    location.reload();
});

function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById("alert-container");

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = "alert";
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alerta);

    setTimeout(() => alerta.remove(), 5000);
}

init();
