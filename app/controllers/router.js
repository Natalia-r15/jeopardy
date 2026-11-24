"use strict";

const express = require('express');
const router = express.Router();

// Aquí irán los GET/POST de preguntas y puntajes
const gameRouter = require('../routes/juego');

// Los admins pueden crear o modificar las preguntas
const adminGameRouter = require('./../routes/admin_juego');

// Todo lo que empiece con /game se va a juego.js
router.use('/game', gameRouter);

// Todo lo que empiece con /admin/game pasa primero por validateAdmin
router.use('/admin/game', validateAdmin, adminGameRouter);

// Middleware de seguridad
function validateAdmin(req, res, next) {
    let authHeader = req.headers['x-auth'];

    if (authHeader !== 'admin') {
        return res.status(403).send('Acceso denegado: se requieren privilegios de administrador.');
    }

    next(); // Si es admin, lo deja pasar a adminGameRouter
}

module.exports = router;
