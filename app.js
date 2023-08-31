const express = require("express")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const app = express()
const port = 3001

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nmc-news",
})

db.connect((err) => {
    if (err) throw err
    console.log("Database connected")
})

app.use(bodyParser.urlencoded({ extended: true }))

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    db.query("SELECT * FROM maintenance", (err, maintenanceResults) => {
        if (err) throw err

        db.query("SELECT * FROM inmarsat", (err, inmarsatResults) => {
            if (err) throw err

            res.render("index", {
                maintenanceItems: maintenanceResults,
                inmarsatItems: inmarsatResults,
            })
        })
    })
})

app.get("/add/maintenance", (req, res) => {
    res.render("addMaintenance")
})

app.post("/add/maintenance", (req, res) => {
    const newItem = {
        action: req.body.action,
        location: req.body.location,
        downtime: req.body.downtime,
    }
    db.query("INSERT INTO maintenance SET ?", newItem, (err, result) => {
        if (err) throw err
        res.redirect("/")
    })
})

app.get("/edit/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    db.query(
        "SELECT * FROM maintenance WHERE id = ?",
        itemId,
        (err, result) => {
            if (err) throw err
            res.render("editMaintenance", { item: result[0] })
        }
    )
})

app.post("/edit/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    const updatedItem = {
        action: req.body.action,
        location: req.body.location,
        downtime: req.body.downtime,
    }
    db.query(
        "UPDATE maintenance SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) throw err
            res.redirect("/")
        }
    )
})

app.get("/delete/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM maintenance WHERE id = ?", itemId, (err, result) => {
        if (err) throw err
        res.redirect("/")
    })
})

app.get("/add/inmarsat", (req, res) => {
    res.render("addInmarsat")
})

app.post("/add/inmarsat", (req, res) => {
    const newItem = {
        aktivasi: req.body.aktivasi,
        deaktivasi: req.body.deaktivasi,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    }
    db.query("INSERT INTO inmarsat SET ?", newItem, (err, result) => {
        if (err) throw err
        res.redirect("/")
    })
})

app.get("/edit/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    db.query("SELECT * FROM inmarsat WHERE id = ?", itemId, (err, result) => {
        if (err) throw err
        res.render("editInmarsat", { item: result[0] })
    })
})

app.post("/edit/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    const updatedItem = {
        aktivasi: req.body.aktivasi,
        deaktivasi: req.body.deaktivasi,
        awal_periode: req.body.awal_periode,
        akhir_periode: req.body.akhir_periode,
    }
    db.query(
        "UPDATE inmarsat SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) throw err
            res.redirect("/")
        }
    )
})

app.get("/delete/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM inmarsat WHERE id = ?", itemId, (err, result) => {
        if (err) throw err
        res.redirect("/")
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
