const express = require("express")
const mysql = require("mysql2")
const bodyParser = require("body-parser")
const app = express()

const ipAddress = "localhost"
const port = 3005

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nmc-news",
})
// Middleware Parse Request
app.use(bodyParser.urlencoded({ extended: true }))
// Middleware view engine
app.set("view engine", "ejs")
app.use("/public", express.static("public"))

db.connect((err) => {
    if (err) throw err 
    console.log("Database connected")
})

// Carrousel View
app.get("/announcer", (req, res) => {
    db.query("SELECT * FROM promo", (err, promoResults) => {
        if (err) {
            console.error("Error querying promo data:", err)
            res.status(500).send("Internal Server Error")
            return
        }

        db.query("SELECT * FROM inmarsat", (err, inmarsatResults) => {
            if (err) {
                console.error("Error querying Inmarsat data:", err)
                res.status(500).send('Internal Server Error')
                return
            }

            db.query("SELECT * FROM maintenance", (err, maintenanceResults) => {
                if (err) {
                    console.error("Error querying maintenance data:", err)
                    res.status(500).send("Internal Server Error")
                    return
                }
            
                res.render("home", {
                    promoItems: promoResults,
                    inmarsatItems: inmarsatResults,
                    maintenanceItems: maintenanceResults,
                })
            });       
        });
    });
});

// Index View
app.get("/announcer/index", (req, res) => {
    db.query("SELECT * FROM maintenance", (err, maintenanceResults) => {
        if (err) {
            console.error("Error querying maintenance data:", err)
            res.status(500).send("Internal Server Error")
            return
        }

        db.query("SELECT * FROM inmarsat", (err, inmarsatResults) => {
            if (err) {
                console.error("Error querying Inmarsat data:", err)
                res.status(500).send('Internal Server Error')
                return
            }

            db.query("SELECT * FROM promo", (err, promoResults) => {
                if (err) {
                    console.error("Error querying promo data:", err)
                    res.status(500).send('Internal Server Error')
                    return
                }

                res.render("index", {
                    maintenanceItems: maintenanceResults,
                    inmarsatItems: inmarsatResults,
                    promoItems: promoResults,
                });
            });
        });
    });
});

// Maintenance Route
app.get("/add/maintenance", (req, res) => {
    res.render("addMaintenance")
})

app.post("/add/maintenance", (req, res) => {
    const newItem = {
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_tanggal_downtime: req.body.awal_tanggal_downtime,
        awal_jam_downtime: req.body.awal_jam_downtime,
        akhir_tanggal_downtime: req.body.akhir_tanggal_downtime,
        akhir_jam_downtime: req.body.akhir_jam_downtime,
    }
    db.query("INSERT INTO maintenance SET ?", newItem, (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send("fail to add maintenance data")
            return
        }
        res.redirect("/announcer/index")
    })
})

app.get("/edit/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    db.query(
        "SELECT * FROM maintenance WHERE id = ?",
        itemId,
        (err, result) => {
            if (err) {
                console.error("Error querying maintenance data for edit:", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            res.render("editMaintenance", { item: result[0] });
        }
    )
})

app.post("/edit/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    const updatedItem = {
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_tanggal_downtime: req.body.awal_tanggal_downtime,
        awal_jam_downtime: req.body.awal_jam_downtime,
        akhir_tanggal_downtime: req.body.akhir_tanggal_downtime,
        akhir_jam_downtime: req.body.akhir_jam_downtime,
    }
    db.query(
        "UPDATE maintenance SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) {
                console.error("Error updating maintenance data:", err);
                res.status(500).send("Fail to update maintenance data");
                return;
            }
            res.redirect("/announcer/index")
        }
    )
})

app.get("/delete/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM maintenance WHERE id = ?", itemId, (err, result) => {
        if (err) {
            console.error("Error deleting maintenance data:", err);
            res.status(500).send("Fail to delete maintenance data");
            return;
        }
        res.redirect("/announcer/index")
    })
})

// Promo Route
app.get("/add/promo", (req, res) => {
    res.render("addPromo")
})

app.post("/add/promo", (req, res) => {
    const newItem = {
        promo: req.body.promo,
        detail: req.body.detail,
        awal_promo: req.body.awal_promo,
        akhir_promo: req.body.akhir_promo,
    }
    db.query("INSERT INTO promo SET ?", newItem, (err, result) => {
        if (err) {
            console.error("Error inserting promo data:", err)
            res.status(500).send("Fail to add promo data")
            return
        }
        res.redirect("/announcer/index")
    })
})

app.get("/edit/promo/:id", (req, res) => {
    const itemId = req.params.id; 
    db.query("SELECT * FROM promo WHERE id = ?", itemId, (err, result) => { 
        if (err) {
            console.error("Error querying promo data for edit:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render("editPromo", { item: result[0] });
    });
});

app.post("/edit/promo/:id", (req, res) => {
    const itemId = req.params.id;
    const updatedItem = {
        promo: req.body.promo,
        detail: req.body.detail,
        awal_promo: req.body.awal_promo,
        akhir_promo: req.body.akhir_promo
    };
    db.query(
        "UPDATE promo SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) {
                console.error("Error updating promo data:", err);
                res.status(500).send("Fail to update promo data");
                return;
            }
            res.redirect("/announcer/index");
        }
    );
});


app.get("/delete/promo/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM promo WHERE id = ?", itemId, (err, result) => {
        if (err) {
            console.error("Error deleting promo data:", err);
            res.status(500).send("Fail to delete promo data");
            return;
        }
        res.redirect("/announcer/index")
    })
})

// Inmarsat Route
app.get("/add/inmarsat", (req, res) => {
    res.render("addInmarsat")
})

app.post("/add/inmarsat", (req, res) => {
    const newItem = {
        aktivasi_IDR: req.body.aktivasi_IDR,
        deaktivasi_IDR: req.body.deaktivasi_IDR,
        aktivasi_USD: req.body.aktivasi_USD,
        deaktivasi_USD: req.body.deaktivasi_USD,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    }
    db.query("INSERT INTO inmarsat SET ?", newItem, (err, result) => {
        if (err) {
            console.error("Error inserting inmarsat data:", err);
            res.status(500).send("Fail to add inmarsat data");
            return;
        }
        res.redirect("/announcer/index")
    })
})

app.get("/edit/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    db.query("SELECT * FROM inmarsat WHERE id = ?", itemId, (err, result) => {
        if (err) {
            console.error("Error querying inmarsat data for edit:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.render("editInmarsat", { item: result[0] })
    })
})

app.post("/edit/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    const updatedItem = {
        aktivasi_IDR: req.body.aktivasi_IDR,
        deaktivasi_IDR: req.body.deaktivasi_IDR,
        aktivasi_USD: req.body.aktivasi_USD,
        deaktivasi_USD: req.body.deaktivasi_USD,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    }
    db.query(
        "UPDATE inmarsat SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) {
                console.error("Error updating inmarsat data:", err);
                res.status(500).send("Fail to update inmarsat data");
                return;
            }
            res.redirect("/announcer/index")
        }
    )
})

app.get("/delete/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM inmarsat WHERE id = ?", itemId, (err, result) => {
        if (err) {
            console.error("Error deleting inmarsat data:", err);
            res.status(500).send("Fail to delete inmarsat data");
            return;
        }
        res.redirect("/announcer/index")
    })
})

// App listen
app.listen(port, ipAddress, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`)
})