"use strict";

const express = require('express');
const router = express.Router();
const path = require('path');

// Al ingresar a '/' o '/home' se muestra la pantalla principal del Jeopardy
router.get(['/', '/home'], (req, res) => {
    const homeFilePath = path.join(__dirname, '../views/home.html');
    res.sendFile(homeFilePath);
});

// Al ingresar a '/tablero' se muestra el tablero de jeopardy
router.get('/tablero', (req, res) => {
    const boardFilePath = path.join(__dirname, '../views/tablero.html');
    res.sendFile(boardFilePath);
});

module.exports = router;
