"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "app/views")));

const router = require("./app/controllers/router"); 

app.use(router);

app.listen(port, () => {
    console.log(`Jeopardy app listening on http://localhost:${port}`);
});
