import express from 'express'
import {pool} from './database.js'
import cors from 'cors'
import dateFormat from "dateformat";

const app = express()
app.use(cors())

const NEEDED_COLS = ["Repairing_code", 'Owner_fullname', "Device_arrival_date", "Breakdown_type", "Repairing_price",
    "Device_name", "Device_type", "Device_production_date", "Master_patronymic", "Master_name", "Master_surname",
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
            console.log("Got a new request!")
            data = process_data(data,
                ["Device_arrival_date", "Device_production_date", "Master_hiring_date"],
                ["Repairing_price"])
            return data
        }).then((data) => {
        setTimeout(() => res.json(data), 1000)
    })
})


app.listen(3009, function () {
    console.log('server started!')
})

