"use strict";

const Category = require('../models/Category');
const Question = require('../models/Question');
const Respuesta = require('../models/Respuesta');

// CATEGORÍAS

async function getCategories() {
    return await Category.find();
}

async function getCategoryById(categoryId) {
    return await Category.findById(categoryId);
}

async function addCategory(nombre) {
    return await Category.create({ nombre });
}

async function updateCategory(categoryId, updatedData) {
    return await Category.findByIdAndUpdate(categoryId, updatedData, { returnDocument: 'after' });
}

async function deleteCategory(categoryId) {
    // Encontrar preguntas de esta categoría
    const preguntas = await Question.find({ categoria: categoryId });
    const questionIds = preguntas.map(q => q._id);
    
    // Borrar respuestas de esas preguntas
    await Respuesta.deleteMany({ pregunta: { $in: questionIds } });
    
    // Borrar preguntas
    await Question.deleteMany({ categoria: categoryId });
    
    // Borrar categoría
    return await Category.findByIdAndDelete(categoryId);
}

// PREGUNTAS Y TABLERO

async function getBoard() {
    const categorias = await Category.find();
    const board = [];

    for (let cat of categorias) {
        const preguntas = await Question.find({ categoria: cat._id });
        const preguntasCompletas = [];

        for (let preg of preguntas) {
            const respCorrecta = await Respuesta.findOne({ pregunta: preg._id, correcta: true });
            
            // Construir el objeto
            preguntasCompletas.push({
                id: preg._id,
                texto: preg.texto,
                categoria: preg.categoria,
                dificultad: preg.dificultad,
                puntos: preg.puntos,
                isRevealed: preg.isRevealed,
                respuesta: respCorrecta ? respCorrecta.texto : "Sin respuesta"
            });
        }

        // Construir
        board.push({
            id: cat._id,
            nombre: cat.nombre,
            questions: preguntasCompletas
        });
    }

    return board;
}

async function getQuestionById(questionId) {
    const pregunta = await Question.findById(questionId);
    if (!pregunta) return undefined;

    const respCorrecta = await Respuesta.findOne({ pregunta: pregunta._id, correcta: true });
    
    return {
        id: pregunta._id,
        texto: pregunta.texto,
        categoria: pregunta.categoria,
        dificultad: pregunta.dificultad,
        puntos: pregunta.puntos,
        isRevealed: pregunta.isRevealed,
        respuesta: respCorrecta ? respCorrecta.texto : "Sin respuesta"
    };
}

async function addQuestion(categoryId, questionData, answerText) {
    // Crear pregunta
    const newQuestion = await Question.create({
        texto: questionData.texto,
        categoria: categoryId,
        dificultad: questionData.dificultad,
        puntos: questionData.puntos
    });

    // Crear respuesta
    await Respuesta.create({
        texto: answerText,
        pregunta: newQuestion._id,
        correcta: true
    });

    return newQuestion;
}

async function updateQuestion(questionId, updatedData) {
    // 'runValidators: true' es para que respete el enum y otras reglas
    return await Question.findByIdAndUpdate(questionId, updatedData, { 
        returnDocument: 'after', 
        runValidators: true 
    });
}

async function deleteQuestion(questionId) {
    await Respuesta.deleteMany({ pregunta: questionId });
    return await Question.findByIdAndDelete(questionId);
}

async function markQuestionAsRevealed(questionId) {
    return await Question.findByIdAndUpdate(questionId, { isRevealed: true }, { returnDocument: 'after' });
}

module.exports = {
    getCategories, getCategoryById, addCategory, updateCategory, deleteCategory,
    getBoard, getQuestionById, addQuestion, 
    updateQuestion, deleteQuestion, markQuestionAsRevealed
};