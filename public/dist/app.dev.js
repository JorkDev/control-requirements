"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var API_URL = "http://localhost:3000/requerimientos";

function cargarRequerimientos() {
  var response, data;
  return regeneratorRuntime.async(function cargarRequerimientos$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch(API_URL));

        case 2:
          response = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(response.json());

        case 5:
          data = _context.sent;
          return _context.abrupt("return", data.requerimientos);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
}

function guardarRequerimiento(requerimiento) {
  var confirmar;
  return regeneratorRuntime.async(function guardarRequerimiento$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          confirmar = window.confirm("¿Deseas guardar este nuevo requerimiento?");

          if (confirmar) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return");

        case 5:
          location.reload();

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requerimiento)
          }));

        case 8:
          mostrarAlerta("Requerimiento guardado exitosamente", "success");

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function eliminarRequerimiento(id) {
  var confirmar;
  return regeneratorRuntime.async(function eliminarRequerimiento$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          confirmar = window.confirm("¿Estás seguro de eliminar este requerimiento?");

          if (confirmar) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return");

        case 5:
          location.reload();

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(fetch("".concat(API_URL, "/").concat(id), {
            method: "DELETE"
          }));

        case 8:
          mostrarAlerta("Requerimiento eliminado correctamente", "danger");

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function exportarPDF(id) {
  var cargarLogo, logo, response, requerimiento, jsPDF, pdf, logoWidth, logoHeight, datos, startY, pdcsOrdenados;
  return regeneratorRuntime.async(function exportarPDF$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;

          cargarLogo = function cargarLogo() {
            var response, blob;
            return regeneratorRuntime.async(function cargarLogo$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap(fetch('./logo.png'));

                  case 2:
                    response = _context4.sent;
                    _context4.next = 5;
                    return regeneratorRuntime.awrap(response.blob());

                  case 5:
                    blob = _context4.sent;
                    return _context4.abrupt("return", new Promise(function (resolve) {
                      var reader = new FileReader();

                      reader.onload = function () {
                        return resolve(reader.result);
                      };

                      reader.readAsDataURL(blob);
                    }));

                  case 7:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          };

          _context5.next = 4;
          return regeneratorRuntime.awrap(cargarLogo());

        case 4:
          logo = _context5.sent;
          _context5.next = 7;
          return regeneratorRuntime.awrap(fetch("".concat(API_URL, "/").concat(id)));

        case 7:
          response = _context5.sent;

          if (response.ok) {
            _context5.next = 10;
            break;
          }

          throw new Error("No se pudo cargar el requerimiento.");

        case 10:
          _context5.next = 12;
          return regeneratorRuntime.awrap(response.json());

        case 12:
          requerimiento = _context5.sent;
          jsPDF = window.jspdf.jsPDF;
          pdf = new jsPDF();
          pdf.setFillColor(195, 181, 155);
          pdf.rect(0, 0, 210, 30, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(20);
          pdf.text("Detalles del Requerimiento", 105, 20, {
            align: "center"
          });
          logoWidth = 70;
          logoHeight = 20;
          pdf.addImage(logo, "PNG", 10, 5, logoWidth, logoHeight);
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          datos = [["ID", requerimiento.id], ["Título", requerimiento.titulo], ["Descripción", requerimiento.descripcion || "N/A"], ["Horas Estimadas", requerimiento.estimado], ["Usuario Asignado", requerimiento.usuario], ["Área", requerimiento.area], ["Estado", requerimiento.estado], ["Fecha de Inicio", requerimiento.fechaInicio], ["Fecha de Cierre", requerimiento.fechaCierre || "No definida"]];
          startY = 40;
          datos.forEach(function (_ref, index) {
            var _ref2 = _slicedToArray(_ref, 2),
                key = _ref2[0],
                value = _ref2[1];

            var posY = startY + index * 10;
            pdf.setFont("helvetica", "bold");
            pdf.text("".concat(key, ":"), 10, posY);

            if (key === "Descripción") {
              var text = pdf.splitTextToSize(value, 150);
              pdf.setFont("helvetica", "normal");
              pdf.text(text, 50, posY);
              startY += text.length * 4;
            } else {
              pdf.setFont("helvetica", "normal");
              pdf.text("".concat(value), 50, posY);
            }
          });

          if (requerimiento.puntosDeControl && requerimiento.puntosDeControl.length > 0) {
            startY += datos.length * 10 + 10;
            pdf.setFontSize(14);
            pdf.text("Puntos de Control", 10, startY);
            startY += 10;
            pdcsOrdenados = requerimiento.puntosDeControl.sort(function (a, b) {
              return new Date(a.fecha) - new Date(b.fecha);
            });
            pdcsOrdenados.forEach(function (pdc, index) {
              pdf.setFontSize(12);
              pdf.setFont("helvetica", "bold");
              pdf.text("PDC ".concat(index + 1, ":"), 10, startY);
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "normal");
              pdf.text("Fecha: ".concat(pdc.fecha), 20, startY + 5);
              var descripcionPDC = pdf.splitTextToSize("Descripci\xF3n: ".concat(pdc.descripcion), 140);
              pdf.text(descripcionPDC, 20, startY + 10);
              var ajusteY = descripcionPDC.length * 4 + 5;

              if (pdc.horasAdicionales) {
                pdf.text("Horas Adicionales: ".concat(pdc.horasAdicionales), 20, startY + 10 + ajusteY);
                ajusteY += 5;
              }

              if (pdc.nuevaFecha) {
                pdf.text("Nueva Fecha: ".concat(pdc.nuevaFecha), 20, startY + 10 + ajusteY);
              }

              startY += ajusteY + 15;
            });
          }

          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text("Generado automáticamente con el sistema", 105, 290, {
            align: "center"
          });
          pdf.save("requerimiento_".concat(requerimiento.id, ".pdf"));
          _context5.next = 39;
          break;

        case 35:
          _context5.prev = 35;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al exportar a PDF:", _context5.t0);
          alert("No se pudo exportar el requerimiento a PDF.");

        case 39:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 35]]);
}

function init() {
  var requerimientos, list, today;
  return regeneratorRuntime.async(function init$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(cargarRequerimientos());

        case 2:
          requerimientos = _context6.sent;
          list = document.getElementById("requerimientos-list");
          list.innerHTML = "";
          today = new Date().toISOString().split("T")[0];
          requerimientos.forEach(function (req) {
            var isExpired = req.fechaCierre && new Date(req.fechaCierre) < new Date(today);
            var li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = "\n            <div>\n                <strong>".concat(req.titulo, "</strong> - ").concat(req.estado, "\n                ").concat(isExpired ? '<span class="badge bg-danger ms-2">¡Vencido!</span>' : "", "\n                <br>\n                <small>\xC1rea: ").concat(req.area, "</small>\n            </div>\n            <div>\n                <a href=\"edit.html?id=").concat(req.id, "\" class=\"btn btn-warning btn-sm me-2\">Editar</a>\n                <button class=\"btn btn-success btn-sm\" onclick=\"exportarPDF(").concat(req.id, ")\">Exportar PDF</button>\n                <button class=\"btn btn-danger btn-sm\" onclick=\"eliminar(").concat(req.id, ")\">Eliminar</button>\n            </div>\n        ");
            list.appendChild(li);
          });

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function eliminar(id) {
  var confirmar = window.confirm("¿Estás seguro de eliminar este requerimiento?");
  if (!confirmar) return;
  eliminarRequerimiento(id).then(function () {
    return location.reload();
  });

  if (eliminarRequerimiento) {
    mostrarAlerta("Punto de Control eliminado correctamente", "danger");
  }
}

document.getElementById("requerimiento-form").addEventListener("submit", function _callee(e) {
  var tituloElem, descripcionElem, estimadoElem, usuarioElem, areaElem, fechaInicioElem, titulo, descripcion, estimado, usuario, area, fechaInicio, nuevoRequerimiento;
  return regeneratorRuntime.async(function _callee$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          e.preventDefault();
          tituloElem = document.getElementById("titulo");
          descripcionElem = document.getElementById("descripcion");
          estimadoElem = document.getElementById("estimado");
          usuarioElem = document.getElementById("usuario");
          areaElem = document.getElementById("area");
          fechaInicioElem = document.getElementById("fechaInicio");

          if (!(!tituloElem || !descripcionElem || !estimadoElem || !usuarioElem || !areaElem || !fechaInicioElem)) {
            _context7.next = 10;
            break;
          }

          console.error("Uno o más elementos del formulario no están definidos.");
          return _context7.abrupt("return");

        case 10:
          titulo = tituloElem.value;
          descripcion = descripcionElem.value;
          estimado = estimadoElem.value;
          usuario = usuarioElem.value;
          area = areaElem.value;
          fechaInicio = fechaInicioElem.value || new Date().toLocaleDateString();

          if (!(!titulo || !estimado || !usuario || !area)) {
            _context7.next = 19;
            break;
          }

          console.error("Faltan campos obligatorios.");
          return _context7.abrupt("return");

        case 19:
          nuevoRequerimiento = {
            id: Date.now(),
            titulo: titulo,
            descripcion: descripcion,
            estimado: estimado,
            usuario: usuario,
            area: area,
            estado: "Pendiente",
            fechaInicio: fechaInicio,
            fechaCierre: null
          };
          _context7.next = 22;
          return regeneratorRuntime.awrap(guardarRequerimiento(nuevoRequerimiento));

        case 22:
          location.reload();

        case 23:
        case "end":
          return _context7.stop();
      }
    }
  });
});

function mostrarAlerta(mensaje, tipo) {
  var alertContainer = document.getElementById("alert-container");
  var alerta = document.createElement("div");
  alerta.className = "alert alert-".concat(tipo, " alert-dismissible fade show");
  alerta.role = "alert";
  alerta.innerHTML = "\n        ".concat(mensaje, "\n        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>\n    ");
  alertContainer.appendChild(alerta);
  setTimeout(function () {
    return alerta.remove();
  }, 5000);
}

init();