const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();

const ipAddress = "localhost";
const port = 3005;

// Create a connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "sakura",
    database: "nmc_news",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Middleware Parse Request
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware view engine
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

// Test the connection pool
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to database:", err);
        process.exit(1); // Exit the process if the database connection fails
    } else {
        console.log("Database connected");
        connection.release(); // Release the connection back to the pool
    }
});

// Query wrapper for convenience
const queryDB = (sql, params) =>
    new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

// Routes

// Carrousel View
app.get("/announcer", async (req, res) => {
    try {
        const promoResults = await queryDB("SELECT * FROM promo");
        const inmarsatResults = await queryDB("SELECT * FROM inmarsat");
        const maintenanceResults = await queryDB("SELECT * FROM maintenance");

        res.render("home", {
            promoItems: promoResults,
            inmarsatItems: inmarsatResults,
            maintenanceItems: maintenanceResults,
        });
    } catch (err) {
        console.error("Error querying data:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Index View
app.get("/announcer/index", async (req, res) => {
    try {
        const maintenanceResults = await queryDB("SELECT * FROM maintenance");
        const inmarsatResults = await queryDB("SELECT * FROM inmarsat");
        const promoResults = await queryDB("SELECT * FROM promo");

        res.render("index", {
            maintenanceItems: maintenanceResults,
            inmarsatItems: inmarsatResults,
            promoItems: promoResults,
        });
    } catch (err) {
        console.error("Error querying data:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Maintenance Routes
app.get("/add/maintenance", (req, res) => {
    res.render("addMaintenance");
});

app.post("/add/maintenance", async (req, res) => {
    const newItem = {
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_tanggal_downtime: req.body.awal_tanggal_downtime,
        awal_jam_downtime: req.body.awal_jam_downtime,
        akhir_tanggal_downtime: req.body.akhir_tanggal_downtime,
        akhir_jam_downtime: req.body.akhir_jam_downtime,
    };
    try {
        await queryDB("INSERT INTO maintenance SET ?", newItem);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error inserting maintenance data:", err);
        res.status(500).send("Fail to add maintenance data");
    }
});

app.get("/edit/maintenance/:id", async (req, res) => {
    try {
        const result = await queryDB("SELECT * FROM maintenance WHERE id = ?", [req.params.id]);
        res.render("editMaintenance", { item: result[0] });
    } catch (err) {
        console.error("Error querying maintenance data for edit:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit/maintenance/:id", async (req, res) => {
    const updatedItem = {
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_tanggal_downtime: req.body.awal_tanggal_downtime,
        awal_jam_downtime: req.body.awal_jam_downtime,
        akhir_tanggal_downtime: req.body.akhir_tanggal_downtime,
        akhir_jam_downtime: req.body.akhir_jam_downtime,
    };
    try {
        await queryDB("UPDATE maintenance SET ? WHERE id = ?", [updatedItem, req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error updating maintenance data:", err);
        res.status(500).send("Fail to update maintenance data");
    }
});

app.get("/delete/maintenance/:id", async (req, res) => {
    try {
        await queryDB("DELETE FROM maintenance WHERE id = ?", [req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error deleting maintenance data:", err);
        res.status(500).send("Fail to delete maintenance data");
    }
});

// Promo Routes
app.get("/add/promo", (req, res) => {
    res.render("addPromo");
});

app.post("/add/promo", async (req, res) => {
    const newItem = {
        promo: req.body.promo,
        detail: req.body.detail,
        awal_promo: req.body.awal_promo,
        akhir_promo: req.body.akhir_promo,
    };
    try {
        await queryDB("INSERT INTO promo SET ?", newItem);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error inserting promo data:", err);
        res.status(500).send("Fail to add promo data");
    }
});

app.get("/edit/promo/:id", async (req, res) => {
    try {
        const result = await queryDB("SELECT * FROM promo WHERE id = ?", [req.params.id]);
        res.render("editPromo", { item: result[0] });
    } catch (err) {
        console.error("Error querying promo data for edit:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit/promo/:id", async (req, res) => {
    const updatedItem = {
        promo: req.body.promo,
        detail: req.body.detail,
        awal_promo: req.body.awal_promo,
        akhir_promo: req.body.akhir_promo,
    };
    try {
        await queryDB("UPDATE promo SET ? WHERE id = ?", [updatedItem, req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error updating promo data:", err);
        res.status(500).send("Fail to update promo data");
    }
});

app.get("/delete/promo/:id", async (req, res) => {
    try {
        await queryDB("DELETE FROM promo WHERE id = ?", [req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error deleting promo data:", err);
        res.status(500).send("Fail to delete promo data");
    }
});

// Inmarsat Routes (similar to maintenance and promo routes)
app.get("/add/inmarsat", (req, res) => {
    res.render("addInmarsat");
});

app.post("/add/inmarsat", async (req, res) => {
    const newItem = {
        aktivasi_IDR: req.body.aktivasi_IDR,
        deaktivasi_IDR: req.body.deaktivasi_IDR,
        aktivasi_USD: req.body.aktivasi_USD,
        deaktivasi_USD: req.body.deaktivasi_USD,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    };
    try {
        await queryDB("INSERT INTO inmarsat SET ?", newItem);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error inserting inmarsat data:", err);
        res.status(500).send("Fail to add inmarsat data");
    }
});

app.get("/edit/inmarsat/:id", async (req, res) => {
    try {
        const result = await queryDB("SELECT * FROM inmarsat WHERE id = ?", [req.params.id]);
        res.render("editInmarsat", { item: result[0] });
    } catch (err) {
        console.error("Error querying inmarsat data for edit:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit/inmarsat/:id", async (req, res) => {
    const updatedItem = {
        aktivasi_IDR: req.body.aktivasi_IDR,
        deaktivasi_IDR: req.body.deaktivasi_IDR,
        aktivasi_USD: req.body.aktivasi_USD,
        deaktivasi_USD: req.body.deaktivasi_USD,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    };
    try {
        await queryDB("UPDATE inmarsat SET ? WHERE id = ?", [updatedItem, req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error updating inmarsat data:", err);
        res.status(500).send("Fail to update inmarsat data");
    }
});

app.get("/delete/inmarsat/:id", async (req, res) => {
    try {
        await queryDB("DELETE FROM inmarsat WHERE id = ?", [req.params.id]);
        res.redirect("/announcer/index");
    } catch (err) {
        console.error("Error deleting inmarsat data:", err);
        res.status(500).send("Fail to delete inmarsat data");
    }
});

// App listen
app.listen(port, ipAddress, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});
