"use strict";

const express = require('express');
const router = express.Router();
const dataHandler = require('./../controllers/data_handler');

// Crear una nueva categoría
router.route('/categories')
    .post((req, res) => {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).send("Bad request. El campo 'nombre' es obligatorio.");
        }

        try {
            const newCategory = dataHandler.addCategory(nombre);
            return res.status(201).json({ 
                message: `Categoría '${newCategory.nombre}' creada exitosamente.`, 
                data: newCategory 
            });
        } catch (e) {
            return res.status(400).send(`Bad request: ${e.message || 'No se pudo crear la categoría'}`);
        }
    });

// Eliminar una categoría (y todas sus preguntas/respuestas en cascada)
router.route('/categories/:id')
    .delete((req, res) => {
        const id = req.params.id;

        try {
            const deletedCategory = dataHandler.deleteCategory(id);
            return res.status(200).json({ 
                message: `Categoría '${deletedCategory.nombre}' y su contenido eliminados exitosamente.`, 
                data: deletedCategory 
            });
        } catch (e) {
            return res.status(404).send(`Bad request: ${e.message || 'No se pudo eliminar la categoría'}`);
        }
    });

// Crear una nueva pregunta y su respuesta
router.route('/questions')
    .post((req, res) => {
        const { categoryId, questionData, answerText } = req.body;

        // 1. Validar que existan los campos principales
        if (!categoryId || !questionData || !answerText) {
            return res.status(400).send("Bad request. Faltan campos: 'categoryId', 'questionData' o 'answerText'.");
        }

        // Validar campos específicos de la pregunta
        const requiredQuestionFields = ['texto', 'dificultad', 'puntos'];
        const missingFields = requiredQuestionFields.filter(field => !questionData[field]);

        if (missingFields.length > 0) {
            return res.status(400).send(`Bad request. Faltan atributos en la pregunta: ${missingFields.join(', ')}`);
        }

        try {
            // El dataHandler se encarga de hacer las validaciones correspondientes

            const newQuestion = dataHandler.addQuestion(categoryId, questionData, answerText);
            
            return res.status(201).json({ 
                message: "Pregunta y respuesta creadas exitosamente.", 
                data: newQuestion 
            });
        } catch (e) {
            return res.status(400).send(`Bad request: ${e.message || 'No se pudo crear la pregunta'}`);
        }
    });

// Actualizar o eliminar una pregunta
router.route('/questions/:id')
    .put((req, res) => {
        const id = req.params.id;
        const questionData = req.body; 

        // En una actualización, no todos los campos son obligatorios, pero al menos debe haber uno
        if (Object.keys(questionData).length === 0) {
            return res.status(400).send("Bad request. Debe proporcionar al menos un campo para actualizar.");
        }

        try {
            const updatedQuestion = dataHandler.updateQuestion(id, questionData);
            return res.status(200).json({ 
                message: "Pregunta actualizada exitosamente.", 
                data: updatedQuestion 
            });
        } catch (e) {
            return res.status(400).send(`Bad request: ${e.message || 'No se pudo actualizar la pregunta'}`);
        }
    })
    
    .delete((req, res) => {
        const id = req.params.id;

        try {
            const deletedQuestion = dataHandler.deleteQuestion(id);
            return res.status(200).json({ 
                message: "Pregunta y sus respuestas asociadas eliminadas exitosamente.", 
                data: deletedQuestion 
            });
        } catch (e) {
            return res.status(404).send(`Bad request: ${e.message || 'No se pudo eliminar la pregunta'}`);
        }
    });

module.exports = router;