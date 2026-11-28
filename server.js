"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Conectado a MongoDB");
    })
    .catch((err) => {
        console.error("Error al conectar a MongoDB:", err.message);
    });

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "app/views")));

const viewsRouter = require("./app/routes/views");
app.use(viewsRouter); 

const router = require("./app/controllers/router"); 
app.use(router);

app.listen(port, () => {
    console.log(`Jeopardy app listening on port ${port}`);
});
