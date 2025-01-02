let API_URL = "";

async function loadEnv() {
    const response = await fetch("/env");
    if (!response.ok) throw new Error("Failed to load environment variables");
    const env = await response.json();
    API_URL = env.API_URL;
}

await loadEnv();

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

if (!id) {
    alert("Requerimiento no encontrado.");
    window.location.href = "index.html";
}

let requerimiento = {};

async function cargarRequerimiento() {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el requerimiento.");
        requerimiento = await response.json();

        document.getElementById("titulo").value = requerimiento.titulo;
        document.getElementById("descripcion").value = requerimiento.descripcion;
        document.getElementById("estimado").value = requerimiento.estimado;
        document.getElementById("usuario").value = requerimiento.usuario;
        document.getElementById("area").value = requerimiento.area;
        document.getElementById("fechaInicio").value = requerimiento.fechaInicio;
        document.getElementById("fechaCierre").value = requerimiento.fechaCierre || "";
        document.getElementById("estado").value = requerimiento.estado;

        cargarPuntosDeControl(requerimiento.puntosDeControl || []);
    } catch (error) {
        console.error("Error al cargar el requerimiento:", error);
        alert("No se pudo cargar el requerimiento.");
        window.location.href = "index.html";
    }
}

function cargarPuntosDeControl(puntosDeControl) {
    const pdcContainer = document.getElementById("pdc-list");
    pdcContainer.innerHTML = "";

    puntosDeControl.forEach((pdc, index) => {
        const pdcForm = generarPDCForm(index, pdc.fecha, pdc.descripcion, pdc.horasAdicionales, pdc.nuevaFecha);
        pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
    });
}

function generarPDCForm(index, fecha = "", descripcion = "", horas = "", nuevaFecha = "") {
    return `
    <div class="pdc-item border rounded p-3 mb-3 position-relative" data-index="${index}">
        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 me-2 mt-2" onclick="eliminarPDC(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"></path>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"></path>
            </svg>
        </button>
        <h5>Punto de Control ${index + 1}</h5>
        <div class="form-group">
            <label>Fecha:</label>
            <input type="date" class="form-control pdc-fecha" value="${fecha}">
        </div>
        <div class="form-group">
            <label>Descripción:</label>
            <textarea class="form-control pdc-descripcion" rows="2">${descripcion}</textarea>
        </div>
        <div class="form-group">
            <label>Horas adicionales:</label>
            <input type="number" class="form-control pdc-horas" value="${horas}" min="0">
        </div>
        <div class="form-group">
            <label>Nueva fecha de entrega:</label>
            <input type="date" class="form-control pdc-nueva-fecha" value="${nuevaFecha}">
        </div>
    </div>
    `;
}

async function guardarCambios(e) {
    e.preventDefault();

    const confirmar = window.confirm("¿Deseas guardar estos cambios?");
    if (!confirmar) return;

    requerimiento.titulo = document.getElementById("titulo").value;
    requerimiento.descripcion = document.getElementById("descripcion").value;
    requerimiento.estimado = document.getElementById("estimado").value;
    requerimiento.usuario = document.getElementById("usuario").value;
    requerimiento.area = document.getElementById("area").value;
    requerimiento.fechaCierre = document.getElementById("fechaCierre").value || null;
    requerimiento.estado = document.getElementById("estado").value;

    const puntosDeControl = [];
    document.querySelectorAll(".pdc-item").forEach((item) => {
        puntosDeControl.push({
            fecha: item.querySelector(".pdc-fecha").value,
            descripcion: item.querySelector(".pdc-descripcion").value,
            horasAdicionales: item.querySelector(".pdc-horas").value || null,
            nuevaFecha: item.querySelector(".pdc-nueva-fecha").value || null
        });
    });

    requerimiento.puntosDeControl = puntosDeControl;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requerimiento),
        });

        if (!response.ok) throw new Error("No se pudo guardar el requerimiento.");
        mostrarAlerta("Requerimiento actualizado correctamente", "success");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al guardar el requerimiento:", error);
        mostrarAlerta("Error al guardar el requerimiento", "danger");
    }
}

function eliminarPDC(index) {
    const confirmar = window.confirm("¿Estás seguro de eliminar este Punto de Control?");
    if (!confirmar) return;

    const pdcContainer = document.getElementById("pdc-list");
    const pdcToDelete = pdcContainer.querySelector(`.pdc-item[data-index="${index}"]`);
    if (pdcToDelete) {
        pdcToDelete.remove();
        reordenarPDCs();
        mostrarAlerta("Punto de Control eliminado correctamente", "danger");
    }
}

function reordenarPDCs() {
    const pdcContainer = document.getElementById("pdc-list");
    const pdcItems = pdcContainer.querySelectorAll(".pdc-item");
    pdcContainer.innerHTML = "";

    pdcItems.forEach((item, newIndex) => {
        const fecha = item.querySelector(".pdc-fecha").value;
        const descripcion = item.querySelector(".pdc-descripcion").value;
        const horas = item.querySelector(".pdc-horas").value;
        const nuevaFecha = item.querySelector(".pdc-nueva-fecha").value;

        const pdcForm = generarPDCForm(newIndex, fecha, descripcion, horas, nuevaFecha);
        pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
    });
}

document.getElementById("add-pdc").addEventListener("click", () => {
    const pdcContainer = document.getElementById("pdc-list");
    const index = pdcContainer.children.length;

    const pdcForm = generarPDCForm(index);
    pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
});

document.getElementById("edit-form").addEventListener("submit", guardarCambios);

cargarRequerimiento();