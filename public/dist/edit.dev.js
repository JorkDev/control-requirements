"use strict";

var API_URL = "http://localhost:3000/requerimientos";
var params = new URLSearchParams(window.location.search);
var id = parseInt(params.get("id"));

if (!id) {
  alert("Requerimiento no encontrado.");
  window.location.href = "index.html";
}

var requerimiento = {};

function cargarRequerimiento() {
  var response;
  return regeneratorRuntime.async(function cargarRequerimiento$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fetch("".concat(API_URL, "/").concat(id)));

        case 3:
          response = _context.sent;

          if (response.ok) {
            _context.next = 6;
            break;
          }

          throw new Error("No se pudo cargar el requerimiento.");

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          requerimiento = _context.sent;
          document.getElementById("titulo").value = requerimiento.titulo;
          document.getElementById("descripcion").value = requerimiento.descripcion;
          document.getElementById("estimado").value = requerimiento.estimado;
          document.getElementById("usuario").value = requerimiento.usuario;
          document.getElementById("area").value = requerimiento.area;
          document.getElementById("fechaInicio").value = requerimiento.fechaInicio;
          document.getElementById("fechaCierre").value = requerimiento.fechaCierre || "";
          document.getElementById("estado").value = requerimiento.estado;
          cargarPuntosDeControl(requerimiento.puntosDeControl || []);
          _context.next = 25;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](0);
          console.error("Error al cargar el requerimiento:", _context.t0);
          alert("No se pudo cargar el requerimiento.");
          window.location.href = "index.html";

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 20]]);
}

function cargarPuntosDeControl(puntosDeControl) {
  var pdcContainer = document.getElementById("pdc-list");
  pdcContainer.innerHTML = ""; // Limpiar lista previa

  puntosDeControl.forEach(function (pdc, index) {
    var pdcForm = generarPDCForm(index, pdc.fecha, pdc.descripcion, pdc.horasAdicionales, pdc.nuevaFecha);
    pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
  });
}

function generarPDCForm(index) {
  var fecha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var descripcion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  var horas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var nuevaFecha = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  return "\n    <div class=\"pdc-item border rounded p-3 mb-3 position-relative\" data-index=\"".concat(index, "\">\n        <button type=\"button\" class=\"btn btn-danger btn-sm position-absolute top-0 end-0 me-2 mt-2\" onclick=\"eliminarPDC(").concat(index, ")\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-trash\" viewBox=\"0 0 16 16\">\n                <path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z\"></path>\n                <path d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z\"></path>\n            </svg>\n        </button>\n        <h5>Punto de Control ").concat(index + 1, "</h5>\n        <div class=\"form-group\">\n            <label>Fecha:</label>\n            <input type=\"date\" class=\"form-control pdc-fecha\" value=\"").concat(fecha, "\">\n        </div>\n        <div class=\"form-group\">\n            <label>Descripci\xF3n:</label>\n            <textarea class=\"form-control pdc-descripcion\" rows=\"2\">").concat(descripcion, "</textarea>\n        </div>\n        <div class=\"form-group\">\n            <label>Horas adicionales:</label>\n            <input type=\"number\" class=\"form-control pdc-horas\" value=\"").concat(horas, "\" min=\"0\">\n        </div>\n        <div class=\"form-group\">\n            <label>Nueva fecha de entrega:</label>\n            <input type=\"date\" class=\"form-control pdc-nueva-fecha\" value=\"").concat(nuevaFecha, "\">\n        </div>\n    </div>\n    ");
}

function guardarCambios(e) {
  var confirmar, puntosDeControl, response;
  return regeneratorRuntime.async(function guardarCambios$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          e.preventDefault();
          confirmar = window.confirm("¿Deseas guardar estos cambios?");

          if (confirmar) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return");

        case 4:
          requerimiento.titulo = document.getElementById("titulo").value;
          requerimiento.descripcion = document.getElementById("descripcion").value;
          requerimiento.estimado = document.getElementById("estimado").value;
          requerimiento.usuario = document.getElementById("usuario").value;
          requerimiento.area = document.getElementById("area").value;
          requerimiento.fechaCierre = document.getElementById("fechaCierre").value || null;
          requerimiento.estado = document.getElementById("estado").value;
          puntosDeControl = [];
          document.querySelectorAll(".pdc-item").forEach(function (item) {
            puntosDeControl.push({
              fecha: item.querySelector(".pdc-fecha").value,
              descripcion: item.querySelector(".pdc-descripcion").value,
              horasAdicionales: item.querySelector(".pdc-horas").value || null,
              nuevaFecha: item.querySelector(".pdc-nueva-fecha").value || null
            });
          });
          requerimiento.puntosDeControl = puntosDeControl;
          _context2.prev = 14;
          _context2.next = 17;
          return regeneratorRuntime.awrap(fetch("".concat(API_URL, "/").concat(id), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requerimiento)
          }));

        case 17:
          response = _context2.sent;

          if (response.ok) {
            _context2.next = 20;
            break;
          }

          throw new Error("No se pudo guardar el requerimiento.");

        case 20:
          mostrarAlerta("Requerimiento actualizado correctamente", "success");
          window.location.href = "index.html";
          _context2.next = 28;
          break;

        case 24:
          _context2.prev = 24;
          _context2.t0 = _context2["catch"](14);
          console.error("Error al guardar el requerimiento:", _context2.t0);
          mostrarAlerta("Error al guardar el requerimiento", "danger");

        case 28:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[14, 24]]);
}

function eliminarPDC(index) {
  var confirmar = window.confirm("¿Estás seguro de eliminar este Punto de Control?");
  if (!confirmar) return;
  var pdcContainer = document.getElementById("pdc-list");
  var pdcToDelete = pdcContainer.querySelector(".pdc-item[data-index=\"".concat(index, "\"]"));

  if (pdcToDelete) {
    pdcToDelete.remove();
    reordenarPDCs();
    mostrarAlerta("Punto de Control eliminado correctamente", "danger");
  }
}

function reordenarPDCs() {
  var pdcContainer = document.getElementById("pdc-list");
  var pdcItems = pdcContainer.querySelectorAll(".pdc-item");
  pdcContainer.innerHTML = "";
  pdcItems.forEach(function (item, newIndex) {
    var fecha = item.querySelector(".pdc-fecha").value;
    var descripcion = item.querySelector(".pdc-descripcion").value;
    var horas = item.querySelector(".pdc-horas").value;
    var nuevaFecha = item.querySelector(".pdc-nueva-fecha").value;
    var pdcForm = generarPDCForm(newIndex, fecha, descripcion, horas, nuevaFecha);
    pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
  });
}

document.getElementById("add-pdc").addEventListener("click", function () {
  var pdcContainer = document.getElementById("pdc-list");
  var index = pdcContainer.children.length;
  var pdcForm = generarPDCForm(index);
  pdcContainer.insertAdjacentHTML("beforeend", pdcForm);
});
document.getElementById("edit-form").addEventListener("submit", guardarCambios);
cargarRequerimiento();