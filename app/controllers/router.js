"use strict";

const express = require('express');
const router = express.Router();

// Importar los routers específicos
const gameRouter = require('../routes/juego');
const adminGameRouter = require('./../routes/admin_juego');

// Middleware de seguridad
function validateAdmin(req, res, next) {
    // Busca el header 'x-auth' en la petición
    let authHeader = req.headers['x-auth'];

    // Si no es exactamente 'admin', bloquea el acceso
    if (authHeader !== 'admin') {
        return res.status(403).send('Acceso denegado: se requieren privilegios de administrador.');
    }

    // Si es correcto, permite continuar a la siguiente función
    next(); 
}

// Todo lo que empiece con /game se va a juego.js
router.use('/game', gameRouter);

// Todo lo que empiece con /admin/game pasa primero por validateAdmin, y si aprueba, va a admin_juego.js
router.use('/admin/game', validateAdmin, adminGameRouter);

module.exports = router;