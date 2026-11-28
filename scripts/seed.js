const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

// Importar modelos
const Category = require('../app/models/Category');
const Question = require('../app/models/Question');
const Respuesta = require('../app/models/Respuesta');

async function seed() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado a MongoDB para migrar datos...");

        // Limpiar la base de datos
        await Category.deleteMany({});
        await Question.deleteMany({});
        await Respuesta.deleteMany({});
        console.log("Base de datos en la nube limpia.");

        // Leer los archivos JSON locales
        const catsData = JSON.parse(fs.readFileSync('./app/data/categorias.json', 'utf8'));
        const questsData = JSON.parse(fs.readFileSync('./app/data/preguntas.json', 'utf8'));
        const ansData = JSON.parse(fs.readFileSync('./app/data/respuestas.json', 'utf8'));

        // Insertar Categorías y guardar un mapa de IDs viejos vs nuevos
        const idMap = {};
        for (const cat of catsData) {
            const newCat = await Category.create({ nombre: cat.nombre });
            idMap[cat.id] = newCat._id;
        }
        console.log("Categorías migradas a la nube.");

        // Insertar Preguntas
        const questIdMap = {};
        for (const q of questsData) {
            // Buscar el ID
            const oldCatId = q.categoriaId || q.categoria;
            const newCatId = idMap[oldCatId];

            // Si no encuentra la categoría, avisa y salta esa pregunta
            if (!newCatId) {
                console.warn(`Categoría no encontrada para: "${q.texto}". ID buscado: ${oldCatId}`);
                continue; 
            }

            const newQ = await Question.create({
                texto: q.texto,
                categoria: newCatId, 
                dificultad: q.dificultad.toLowerCase().replace('í','i').replace('á','a'),
                puntos: q.puntos,
                isRevealed: q.isRevealed || false
            });
            questIdMap[q.id] = newQ._id;
        }
        console.log("Preguntas migradas a la nube.");

        // Insertar Respuestas
        for (const r of ansData) {
            await Respuesta.create({
                texto: r.texto,
                pregunta: questIdMap[r.preguntaId], 
                correcta: r.correcta
            });
        }
        console.log("Respuestas migradas a la nube.");

        console.log("Migración completada, la base de datos está lista.");
        process.exit();

    } catch (error) {
        console.error("Error en la migración:", error);
        process.exit(1);
    }
}

seed();