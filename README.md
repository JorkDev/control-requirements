
# Gestión de Requerimientos - Aplicación Web

Esta aplicación permite gestionar requerimientos con funciones para crear, editar, eliminar y exportar a PDF cada requerimiento. Utiliza Node.js y Express como backend, con una base de datos local en JSON.

## **Estructura del Proyecto**
```
requerimientos-app/
├── db.json                   # Base de datos local (JSON)
├── public/                   # Archivos estáticos (HTML, CSS, JS, imágenes)
│   ├── index.html            # Página principal de la aplicación
│   ├── edit.html             # Página de edición de requerimientos
│   ├── app.js                # Lógica principal del frontend
│   ├── edit.js               # Lógica para editar requerimientos
│   └── logo.png              # Logo de la aplicación
├── server.js                 # Servidor backend con Node.js y Express
├── package.json              # Configuración del proyecto y dependencias
└── package-lock.json         # Archivo de bloqueo de dependencias
```

---

## **Requisitos Previos**
- **Node.js** y **npm** instalados.
- Editor de texto como **VS Code**.
- Navegador web (Chrome, Firefox, etc.).

---

## **Instalación y Uso**
1. **Clona o descarga el repositorio** del proyecto.
2. Abre la terminal y navega a la carpeta raíz del proyecto:
   ```bash
   cd requerimientos-app
   ```
3. **Instala las dependencias**:
   ```bash
   npm install
   ```
4. **Inicia el servidor**:
   ```bash
   node server.js
   ```
5. Abre tu navegador y visita:
   ```
   http://localhost:3000
   ```

---

## **Uso de la Aplicación**

### **Página Principal - `index.html`**
- **Crear un Requerimiento**:
  Completa el formulario con título, descripción, horas estimadas, fecha de inicio, usuario y área. Haz clic en **"Agregar"**.
- **Editar un Requerimiento**:
  Haz clic en **"Editar"** para modificarlo.
- **Eliminar un Requerimiento**:
  Haz clic en **"Eliminar"** y confirma la acción.
- **Exportar a PDF**:
  Haz clic en **"Exportar PDF"** para descargar un reporte detallado.

### **Página de Edición - `edit.html`**
- Modifica campos como título, descripción, horas estimadas, usuario, área, estado y fecha de cierre.
- **Agregar Puntos de Control**:
  - Haz clic en **"Añadir Punto de Control"**.
  - Completa la fecha, descripción y horas adicionales.
- **Eliminar Puntos de Control**:
  - Usa el botón **"Eliminar"** en cada PDC.

### **Alertas y Confirmaciones**
- Confirmaciones para eliminar o guardar cambios.
- Alertas dinámicas (Bootstrap):
  - **Éxito**: "Requerimiento guardado correctamente."
  - **Error**: "No se pudo realizar la operación."

---

## **Base de Datos Local - `db.json`**
Ejemplo de estructura:
```json
{
  "requerimientos": [
    {
      "id": 1734379545793,
      "titulo": "Título del requerimiento",
      "descripcion": "Descripción detallada",
      "estimado": "4",
      "usuario": "Juan Pérez",
      "area": "Sistemas",
      "estado": "Pendiente",
      "fechaInicio": "2024-01-01",
      "fechaCierre": null,
      "puntosDeControl": [
        {
          "fecha": "2024-01-02",
          "descripcion": "Primer punto de control",
          "horasAdicionales": "2",
          "nuevaFecha": "2024-01-03"
        }
      ]
    }
  ]
}
```

---

## **Detener el Servidor**
Presiona `Ctrl + C` en la terminal.

---

## **Resumen**
1. **Instala dependencias** con `npm install`.
2. **Inicia el servidor** con `node server.js`.
3. Usa la aplicación en `http://localhost:3000`.
4. Gestiona requerimientos y Puntos de Control fácilmente.
