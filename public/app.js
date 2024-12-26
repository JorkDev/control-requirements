const API_URL = "http://network.rushhosting.net:10013/requerimientos";
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

        let startY = marginTop;

        const agregarEncabezado = () => {
            pdf.setFillColor(195, 181, 155);
            pdf.rect(0, 0, 210, 30, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detalles del Requerimiento", 105, 20, { align: "center" });
            pdf.addImage(logo, "PNG", 10, 5, 70, 20);

            startY = marginTop + 30;
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);
        };

        const verificarSaltoPagina = () => {
            if (startY > pageHeight - marginBottom) {
                pdf.addPage();
                agregarEncabezado();
            }
        };

        agregarEncabezado();

        const datos = [
            ["ID", requerimiento.id],
            ["Título", requerimiento.titulo],
            ["Descripción", requerimiento.descripcion || "N/A"],
            ["Horas Estimadas", requerimiento.estimado],
            ["Usuario Asignado", requerimiento.usuario],
            ["Área", requerimiento.area],
            ["Estado", requerimiento.estado],
            ["Fecha de Inicio", requerimiento.fechaInicio],
            ["Fecha de Cierre", requerimiento.fechaCierre || "No definida"]
        ];

        datos.forEach(([key, value]) => {
            verificarSaltoPagina();
            pdf.setFont("helvetica", "bold");
            pdf.text(`${key}:`, 10, startY);

            pdf.setFont("helvetica", "normal");
            if (key === "Descripción") {
                const text = pdf.splitTextToSize(value, 150);
                pdf.text(text, 50, startY);
                startY += text.length * 5;
            } else {
                pdf.text(`${value}`, 50, startY);
                startY += lineHeight;
            }
        });

        if (requerimiento.puntosDeControl && requerimiento.puntosDeControl.length > 0) {
            verificarSaltoPagina();
            pdf.setFontSize(14);
            pdf.text("Puntos de Control", 10, startY);
            startY += lineHeight;

            const pdcsOrdenados = requerimiento.puntosDeControl.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            pdcsOrdenados.forEach((pdc, index) => {
                verificarSaltoPagina();
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text(`PDC ${index + 1}:`, 10, startY);

                pdf.setFont("helvetica", "normal");
                pdf.text(`Fecha: ${pdc.fecha}`, 20, startY + 5);

                const descripcionPDC = pdf.splitTextToSize(`Descripción: ${pdc.descripcion}`, 140);
                pdf.text(descripcionPDC, 20, startY + 10);

                let ajusteY = descripcionPDC.length * 5 + 5;

                if (pdc.horasAdicionales) {
                    pdf.text(`Horas Adicionales: ${pdc.horasAdicionales}`, 20, startY + 10 + ajusteY);
                    ajusteY += 5;
                }
                if (pdc.nuevaFecha) {
                    pdf.text(`Nueva Fecha: ${pdc.nuevaFecha}`, 20, startY + 10 + ajusteY);
                }

                startY += ajusteY + 15;
            });
        }

        verificarSaltoPagina();
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("Generado automáticamente con el sistema", 105, 290, { align: "center" });

        pdf.save(`requerimiento_${requerimiento.id}.pdf`);
    } catch (error) {
        console.error("Error al exportar a PDF:", error);
        alert("No se pudo exportar el requerimiento a PDF.");
    }
}

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
                ${isCulminado  ? '<span class="badge bg-success text-light ms-2">Culminado</span>'  : isExpired  ? '<span class="badge bg-danger ms-2">Vencido</span>' : isInProccess ? '<span class="badge bg-primary ms-2">En Proceso</span>' : ""}
                <br>
                <small>Área: ${req.area}</small>
            </div>
            <div style="
                display: flex;
                gap: 10px;
                justify-content: center;
                align-items: inherit;
			">
                <a href="edit.html?id=${req.id}" class="btn btn-warning btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
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
    if(eliminarRequerimiento){
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