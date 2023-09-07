const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const port = process.env.PORT || 3002

// Konfigurasi database MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "your_database_name",
})

// Koneksi ke database
db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err)
        return
    }
    console.log("Connected to MySQL database")
})

// Middleware untuk mengurai body dari permintaan HTTP
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set folder views sebagai tempat penyimpanan file HTML (EJS)
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Routing untuk halaman utama
app.get("/", (req, res) => {
    // Ambil data dari database untuk ditampilkan di halaman home
    db.query("SELECT * FROM maintenance", (err, maintenanceItems) => {
        if (err) throw err

        db.query("SELECT * FROM inmarsat", (err, inmarsatItems) => {
            if (err) throw err

            res.render("home", { maintenanceItems, inmarsatItems })
        })
    })
})

// Operasi CRUD untuk tabel maintenance
app.get("/add/maintenance", (req, res) => {
    res.render("addMaintenance")
})

app.post("/add/maintenance", (req, res) => {
    const newItem = {
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_downtime: req.body.awal_downtime,
        akhir_downtime: req.body.akhir_downtime,
    }
    db.query("INSERT INTO maintenance SET ?", newItem, (err, result) => {
        if (err) throw err
        kirimPembaruanKeKlien()
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
        maintenance: req.body.maintenance,
        detail: req.body.detail,
        awal_downtime: req.body.awal_downtime,
        akhir_downtime: req.body.akhir_downtime,
    }
    db.query(
        "UPDATE maintenance SET ? WHERE id = ?",
        [updatedItem, itemId],
        (err, result) => {
            if (err) throw err
            kirimPembaruanKeKlien()
            res.redirect("/")
        }
    )
})

app.get("/delete/maintenance/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM maintenance WHERE id = ?", itemId, (err, result) => {
        if (err) throw err
        kirimPembaruanKeKlien()
        res.redirect("/")
    })
})

// Operasi CRUD untuk tabel inmarsat
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
        kirimPembaruanKeKlien()
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
            kirimPembaruanKeKlien()
            res.redirect("/")
        }
    )
})

app.get("/delete/inmarsat/:id", (req, res) => {
    const itemId = req.params.id
    db.query("DELETE FROM inmarsat WHERE id = ?", itemId, (err, result) => {
        if (err) throw err
        kirimPembaruanKeKlien()
        res.redirect("/")
    })
})

// WebSocket untuk mengirim pembaruan ke klien
function kirimPembaruanKeKlien() {
    io.emit("dataUpdate") // 'dataUpdate' adalah nama peristiwa yang dikirim ke klien
}

// Mendengarkan server pada port yang ditentukan
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
