import express, {query} from 'express'
import {pool} from './database.js'
import cors from 'cors'
import dateFormat from "dateformat";

const app = express()
app.use(cors())
app.use(express.json())

const NEEDED_COLS = ["Repairing_code", 'Owner_fullname', "Device_arrival_date", "Breakdown_type", "Repairing_price",
    "Device_name", "Device_type", "Device_production_date", "Master_surname", "Master_name", "Master_patronymic",
    "Master_qualification", "Master_hiring_date"]

function process_data(d, date_columns, ruble_columns) {
    let data = d[0]
    for (let i = 0; i < data.length; i++) {
        for (let col of ruble_columns) {
            data[i][col] = data[i][col].toLocaleString() + " ₽"
        }
        for (let col of date_columns) {
            data[i][col] = dateFormat(data[i][col], "mmmm dS, yyyy, h:MM:ss TT")
        }
    }
    d[0] = data
    return d
}


app.get('/get_abonents', function (req, res) {
    pool.query("SELECT " + NEEDED_COLS.join(", ") +
        " FROM Repairings INNER JOIN Devices ON Repairings.Device_code = Devices.Device_code" +
        " INNER JOIN MASTERS ON Repairings.Master_code = Masters.Master_code;")
        .then((data) => {
            // console.log("Got a new request!")
            data = process_data(data,
                ["Device_arrival_date", "Device_production_date", "Master_hiring_date"],
                ["Repairing_price"])
            return data
        }).then((data) => {
        setTimeout(() => res.json(data), 3000)
    })
})


app.get('/get_masters', function (req, res) {
    pool.query("SELECT Master_code, Master_surname, Master_name, Master_patronymic from Masters;")
        .then((data) => {
            // console.log(data)
            data[0] = data[0].map(el => [el.Master_code, el.Master_surname, el.Master_name, el.Master_patronymic])
            return data
        })
        .then(data => res.json(data))
})

app.get('/get_devices', function (req, res) {
    pool.query("SELECT Device_code, Device_name from Devices;")
        .then((data) => {
            // console.log(data)
            data[0] = data[0].map(el => [el.Device_code, el.Device_name])
            return data
        })
        .then(data => res.json(data))
})

app.post('/add_device', async (req, res) => {
    let data = req.body
    res.send("Data received succesfully")

    const maximal_id = Math.max(...await pool.query("SELECT Device_code from Devices;")
        .then((data) => data[0].map(e => e.Device_code))) + 1

    pool.query("INSERT INTO Devices VALUES (?, ?, ?, ?)",
        [maximal_id,
            data.name_of_device,
            data.type_of_device,
            data.production_date
        ])
        .catch(e => {
            console.log(e)
        })
})


app.post('/add_repairing', async (req, res) => {
    let data = req.body
    res.send("Data received succesfully")
    console.log(data)
    // console.log(Object.keys(data))

    const maximal_id = Math.max(...await pool.query("SELECT Repairing_code from Repairings;")
        .then((data) => data[0].map(e => e.Repairing_code))) + 1

    pool.query("INSERT INTO Repairings VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            data.device_code,
            data.master_code,
            data.owner_fullname,
            data.device_arrival_date,
            data.breakdown_type,
            data.repairing_price,
            maximal_id,
        ])
        .catch(e => {
            console.log(e)
        })
})



app.get('/get_mean', function (req, res) {
    pool.query("SELECT AVG(Repairing_price) FROM Repairings;")
        .then((data) => {
            return data[0][0]['AVG(Repairing_price)']
        })
        .then(data => res.json(data))
})

app.listen(3009, function () {
    console.log('server started!')
})

