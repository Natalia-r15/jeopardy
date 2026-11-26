"use strict";

const fs = require('fs');
const path = require('path');

const Category = require('./category');
const Question = require('./question');
const Respuesta = require('./respuesta');

// Rutas a los 3 archivos
const pathCategorias = path.join(__dirname, '../data/categorias.json');
const pathPreguntas = path.join(__dirname, '../data/preguntas.json');
const pathRespuestas = path.join(__dirname, '../data/respuestas.json');

// Cargar y convertir a instancias de clase al iniciar
let categorias = JSON.parse(fs.readFileSync(pathCategorias, 'utf8')).map(Category.createFromObject);
let preguntas = JSON.parse(fs.readFileSync(pathPreguntas, 'utf8')).map(Question.createFromObject);
let respuestas = JSON.parse(fs.readFileSync(pathRespuestas, 'utf8')).map(Respuesta.createFromObject);

// Funciones para guardar cambios
function saveCategorias() {
    fs.writeFileSync(pathCategorias, JSON.stringify(categorias.map(c => c.toObject()), null, 2), 'utf8');
}
function savePreguntas() {
    fs.writeFileSync(pathPreguntas, JSON.stringify(preguntas.map(q => q.toObject()), null, 2), 'utf8');
}
function saveRespuestas() {
    fs.writeFileSync(pathRespuestas, JSON.stringify(respuestas.map(r => r.toObject()), null, 2), 'utf8');
}

// CATEGORÍAS
function getCategories() { return categorias.map(c => c.toObject()); }

function getCategoryById(categoryId) {
    const cat = categorias.find(c => c.id === categoryId);
    return cat ? cat.toObject() : undefined;
}

function addCategory(nombre) {
    const newCategory = new Category(nombre);
    categorias.push(newCategory);
    saveCategorias();
    return newCategory.toObject();
}

function updateCategory(categoryId, updatedData) {
    const cat = categorias.find(c => c.id === categoryId);
    if (!cat) throw new Error("Categoría no encontrada.");
    
    if (updatedData.nombre !== undefined) cat.nombre = updatedData.nombre;
    saveCategorias();
    return cat.toObject();
}

function deleteCategory(categoryId) {
    const index = categorias.findIndex(c => c.id === categoryId);
    if (index === -1) throw new Error("Categoría no encontrada.");
    
    const catEliminada = categorias[index].toObject();
    categorias.splice(index, 1);
    saveCategorias();

    const preguntasAEliminar = preguntas.filter(p => p.categoria === categoryId);
    preguntasAEliminar.forEach(p => deleteQuestion(p.id, false));
    
    savePreguntas();
    saveRespuestas();
    return catEliminada;
}

// PREGUNTAS Y TABLERO
function getBoard() {
    return categorias.map(cat => {
        const preguntasDeCat = preguntas.filter(p => p.categoria === cat.id);
        const preguntasCompletas = preguntasDeCat.map(p => {
            const respCorrecta = respuestas.find(r => r.preguntaId === p.id && r.correcta === true);
            return {
                ...p.toObject(),
                respuesta: respCorrecta ? respCorrecta.texto : "Sin respuesta correcta"
            };
        });
        return { ...cat.toObject(), questions: preguntasCompletas };
    });
}

function getQuestionById(questionId) {
    const p = preguntas.find(q => q.id === questionId);
    if (!p) return undefined;
    
    const respCorrecta = respuestas.find(r => r.preguntaId === questionId && r.correcta === true);
    return {
        ...p.toObject(),
        respuesta: respCorrecta ? respCorrecta.texto : "Sin respuesta correcta"
    };
}

function addQuestion(categoryId, questionData, answerText) {
    if (!categorias.find(c => c.id === categoryId)) throw new Error("Categoría no encontrada.");
    
    // La clase Question valida texto, dificultad, puntos, etc.
    const newQuestion = new Question(questionData.texto, categoryId, questionData.dificultad, questionData.puntos);
    preguntas.push(newQuestion);
    savePreguntas();

    // La clase Respuesta valida que correcta sea true o false y el UUID sea válido
    const newRespuesta = new Respuesta(newQuestion.id, answerText, true);
    respuestas.push(newRespuesta);
    saveRespuestas();

    return newQuestion.toObject();
}

function updateQuestion(questionId, updatedData) {
    const q = preguntas.find(p => p.id === questionId);
    if (!q) throw new Error("Pregunta no encontrada.");

    if (updatedData.texto !== undefined) q.texto = updatedData.texto;
    if (updatedData.dificultad !== undefined) q.dificultad = updatedData.dificultad;
    if (updatedData.puntos !== undefined) q.puntos = updatedData.puntos;
    if (updatedData.categoria !== undefined) q.categoria = updatedData.categoria;
    if (updatedData.isRevealed !== undefined) q.isRevealed = updatedData.isRevealed;
    
    savePreguntas();
    return q.toObject();
}

function deleteQuestion(questionId, saveNow = true) {
    const index = preguntas.findIndex(p => p.id === questionId);
    if (index === -1) throw new Error("Pregunta no encontrada.");

    const pregEliminada = preguntas[index].toObject();
    preguntas.splice(index, 1);
    if (saveNow) savePreguntas();

    // Eliminar respuestas asociadas
    const respAEliminar = respuestas.filter(r => r.preguntaId === questionId);
    respAEliminar.forEach(r => {
        const rIndex = respuestas.findIndex(resp => resp.id === r.id);
        if (rIndex !== -1) respuestas.splice(rIndex, 1);
    });
    if (saveNow) saveRespuestas();

    return pregEliminada;
}

function markQuestionAsRevealed(questionId) {
    return updateQuestion(questionId, { isRevealed: true });
}

module.exports = {
    getCategories, getCategoryById, addCategory, updateCategory, deleteCategory,
    getBoard, getQuestionById, addQuestion, updateQuestion, deleteQuestion, markQuestionAsRevealed
};