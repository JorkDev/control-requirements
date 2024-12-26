const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 10013;

app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, "db.json");

app.get("/requerimientos", (req, res) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer la base de datos" });
        res.json(JSON.parse(data));
    });
});

app.get("/requerimientos/:id", (req, res) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

        const db = JSON.parse(data);
        const requerimiento = db.requerimientos.find((r) => r.id === parseInt(req.params.id));
        if (!requerimiento) return res.status(404).json({ error: "Requerimiento no encontrado" });

        res.json(requerimiento);
    });
});

app.post("/requerimientos", (req, res) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

        const db = JSON.parse(data);
        db.requerimientos.push(req.body);

        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error al guardar en la base de datos" });
            res.status(201).json(req.body);
        });
    });
});

app.put("/requerimientos/:id", (req, res) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

        const db = JSON.parse(data);
        const index = db.requerimientos.findIndex((r) => r.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: "Requerimiento no encontrado" });

        db.requerimientos[index] = { ...db.requerimientos[index], ...req.body };

        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error al guardar en la base de datos" });
            res.json(db.requerimientos[index]);
        });
    });
});

app.delete("/requerimientos/:id", (req, res) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer la base de datos" });

        const db = JSON.parse(data);
        db.requerimientos = db.requerimientos.filter((r) => r.id !== parseInt(req.params.id));

        fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Error al guardar en la base de datos" });
            res.status(204).send();
        });
    });
});

app.use((req, res, next) => {
    if (!path.extname(req.path)) {
        const potentialHtmlPath = path.join(__dirname, "public", `${req.path}.html`);
        if (fs.existsSync(potentialHtmlPath)) {
            req.url += ".html";
        }
    }
    next();
});

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server running at http://network.rushhosting.net:${PORT}`);
});
