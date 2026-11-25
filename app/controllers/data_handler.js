"use strict";

const fs = require('fs');
const path = require('path');
const { generateUUID } = require('./utils');

// Rutas a los 3 archivos de información
const pathCategorias = path.join(__dirname, '../data/categorias.json');
const pathPreguntas = path.join(__dirname, '../data/preguntas.json');
const pathRespuestas = path.join(__dirname, '../data/respuestas.json');

// Cargar los datos en memoria
let categorias = JSON.parse(fs.readFileSync(pathCategorias, 'utf8'));
let preguntas = JSON.parse(fs.readFileSync(pathPreguntas, 'utf8'));
let respuestas = JSON.parse(fs.readFileSync(pathRespuestas, 'utf8'));

// Funciones para guardar cambios
function saveCategorias() {
    fs.writeFileSync(pathCategorias, JSON.stringify(categorias, null, 2), 'utf8');
}
function savePreguntas() {
    fs.writeFileSync(pathPreguntas, JSON.stringify(preguntas, null, 2), 'utf8');
}
function saveRespuestas() {
    fs.writeFileSync(pathRespuestas, JSON.stringify(respuestas, null, 2), 'utf8');
}

// CATEGORÍAS

// Obtener todas las categorías
function getCategories() {
    return categorias;
}

// Obtener una categoría por su ID
function getCategoryById(categoryId) {
    return categorias.find(cat => cat.id === categoryId);
}

// Crear una nueva categoría
function addCategory(categoryName) {
    const newCategoryId = generateUUID();
    
    const newCategory = {
        id: newCategoryId,
        nombre: categoryName
    };
    
    categorias.push(newCategory);
    saveCategorias();
    
    return newCategory;
}

// Actualizar una categoría
function updateCategory(categoryId, updatedData) {
    const index = categorias.findIndex(cat => cat.id === categoryId);
    if (index === -1) {
        throw new Error("Categoría no encontrada.");
    }

    if (updatedData.nombre !== undefined) categorias[index].nombre = updatedData.nombre;
    
    saveCategorias();
    
    return categorias[index];
}

// Eliminar una categoría (y todas sus preguntas y respuestas asociadas)
function deleteCategory(categoryId) {
    const index = categorias.findIndex(cat => cat.id === categoryId);
    if (index === -1) {
        throw new Error("Categoría no encontrada.");
    }

    const categoriaEliminada = categorias[index];

    // Eliminar la categoría
    categorias.splice(index, 1);
    saveCategorias();

    // Eliminar todas las preguntas de esta categoría
    const preguntasAEliminar = preguntas.filter(p => p.categoria === categoryId);
    preguntasAEliminar.forEach(preg => {
        const pregIndex = preguntas.findIndex(p => p.id === preg.id);
        if (pregIndex !== -1) {
            preguntas.splice(pregIndex, 1);
        }
    });
    savePreguntas();

    // Eliminar todas las respuestas de esas preguntas
    preguntasAEliminar.forEach(preg => {
        const respuestasAEliminar = respuestas.filter(r => r.preguntaId === preg.id);
        respuestasAEliminar.forEach(resp => {
            const respIndex = respuestas.findIndex(r => r.id === resp.id);
            if (respIndex !== -1) {
                respuestas.splice(respIndex, 1);
            }
        });
    });
    saveRespuestas();

    return categoriaEliminada;
}

// PREGUNTAS

// Obtener el tablero completo
function getBoard() {
    return categorias.map(cat => {
        const preguntasDeEstaCategoria = preguntas.filter(p => p.categoria === cat.id);
        
        const preguntasCompletas = preguntasDeEstaCategoria.map(p => {
            const respuestaCorrecta = respuestas.find(r => r.preguntaId === p.id && r.correcta === true);
            
            return {
                id: p.id,
                categoria: p.categoria,
                texto: p.texto,
                dificultad: p.dificultad,
                puntos: p.puntos,
                respuesta: respuestaCorrecta ? respuestaCorrecta.texto : "Sin respuesta correcta"
            };
        });

        return {
            id: cat.id,
            nombre: cat.nombre,
            questions: preguntasCompletas
        };
    });
}

// Obtener una pregunta específica por su ID
function getQuestionById(questionId) {
    const pregunta = preguntas.find(p => p.id === questionId);
    if (!pregunta) return undefined;

    const respuestaCorrecta = respuestas.find(r => r.preguntaId === questionId && r.correcta === true);
    
    return {
        id: pregunta.id,
        categoria: pregunta.categoria,
        texto: pregunta.texto,
        dificultad: pregunta.dificultad,
        puntos: pregunta.puntos,
        respuesta: respuestaCorrecta ? respuestaCorrecta.texto : "Sin respuesta correcta"
    };
}

// Agregar una nueva pregunta con su respuesta
function addQuestion(categoryId, questionData, answerText) {
    const categoria = getCategoryById(categoryId);
    if (!categoria) {
        throw new Error("Categoría no encontrada.");
    }

    // UUID único para la pregunta
    const newPreguntaId = generateUUID();
    
    const newPregunta = {
        id: newPreguntaId,
        categoria: categoryId,
        texto: questionData.texto,
        dificultad: questionData.dificultad,
        puntos: questionData.puntos
    };
    
    preguntas.push(newPregunta);
    savePreguntas();

    // UUID único para la respuesta
    const newRespuestaId = generateUUID();
    
    const newRespuesta = {
        id: newRespuestaId,
        preguntaId: newPreguntaId,
        texto: answerText,
        correcta: true
    };
    
    respuestas.push(newRespuesta);
    saveRespuestas();

    return newPregunta;
}

// Actualizar una pregunta
function updateQuestion(questionId, updatedData) {
    const index = preguntas.findIndex(p => p.id === questionId);
    if (index === -1) {
        throw new Error("Pregunta no encontrada.");
    }

    if (updatedData.texto !== undefined) preguntas[index].texto = updatedData.texto;
    if (updatedData.dificultad !== undefined) preguntas[index].dificultad = updatedData.dificultad;
    if (updatedData.puntos !== undefined) preguntas[index].puntos = updatedData.puntos;
    if (updatedData.categoria !== undefined) preguntas[index].categoria = updatedData.categoria;
    
    savePreguntas();
    
    return preguntas[index];
}

// Eliminar una pregunta (y todas sus respuestas asociadas)
function deleteQuestion(questionId) {
    const index = preguntas.findIndex(p => p.id === questionId);
    if (index === -1) {
        throw new Error("Pregunta no encontrada.");
    }

    const preguntaEliminada = preguntas[index];

    preguntas.splice(index, 1);
    savePreguntas();

    const respuestasAEliminar = respuestas.filter(r => r.preguntaId === questionId);
    respuestasAEliminar.forEach(resp => {
        const respIndex = respuestas.findIndex(r => r.id === resp.id);
        if (respIndex !== -1) {
            respuestas.splice(respIndex, 1);
        }
    });
    saveRespuestas();

    return preguntaEliminada;
}

// Marcar una pregunta como respondida
function markQuestionAsRevealed(questionId) {
    return getQuestionById(questionId);
}

module.exports = {
    // Categorías
    getCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Preguntas y tablero
    getBoard,
    getQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    markQuestionAsRevealed
};