"use strict";

const express = require('express');
const router = express.Router();
const dataHandler = require('./../controllers/data_handler');

// Obtener el tablero completo, todas las categorías y las preguntas
router.route('/')
    .get(async (req, res) => {
        let query = req.query.filter;
        let board;

        try {
            board = await dataHandler.getBoard();
        } catch (e) {
            return res.status(500).send('No se pudo obtener el tablero de Jeopardy.');
        }

        if (query === undefined) {
            res.status(200).json(board);
        } else {
            let search = query.toLowerCase();

            // Filtrar categorías cuyo nombre coincida con la búsqueda
            let filteredBoard = board.filter(category => {
                let categoryName = category.nombre ? category.nombre.toLowerCase() : "";
                return categoryName.includes(search);
            });

            res.status(200).json(filteredBoard);
        }
    });

// Obtener múltiples preguntas por sus IDs
router.route('/questions')
    .post(async (req, res) => {
        let queIds = req.body.queIds;
        let questions = [];

        if (!queIds || !Array.isArray(queIds)) {
            return res.status(400).send("El campo 'queIds' es obligatorio y debe ser un array.");
        }

        try {
            for (let id of queIds) {
                let question = await dataHandler.getQuestionById(id);
                if (question != undefined) {
                    questions.push(question);
                } else {
                    return res.status(404).send(`Pregunta con id '${id}' no encontrada.`);
                }
            }
            return res.status(200).json(questions);
        } catch (e) {
            console.log("ERROR: ", e);
            return res.status(500).send('No se pudo obtener las preguntas.');
        }
    });

// Obtener una categoría específica por su ID
router.route('/:id')
    .get(async (req, res) => {
        let id = req.params.id;
        
        try {
            let category = await dataHandler.getCategoryById(id);

            if (category != undefined) {
                res.status(200).json(category);
            } else {
                res.status(404).send(`Categoría con id '${id}' no encontrada.`);
            }
        } catch (e) {
            res.status(500).send("Error al buscar la categoría.");
        }
    });

// Marcar una pregunta como respondida
router.route('/question/:id/reveal')
    .put(async (req, res) => {
        let queId = req.params.id;
        
        try {
            let updatedQuestion = await dataHandler.markQuestionAsRevealed(queId);
            
            if (updatedQuestion) {
                res.status(200).json(updatedQuestion);
            } else {
                res.status(404).send(`Pregunta con id '${queId}' no encontrada.`);
            }
        } catch (e) {
            console.log("ERROR:", e);
            res.status(500).send('No se pudo actualizar el estado de la pregunta.');
        }
    });

module.exports = router;