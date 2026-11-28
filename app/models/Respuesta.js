const mongoose = require('mongoose');

const respuestaSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: [true, 'El texto de la respuesta es obligatorio'],
        trim: true
    },
    pregunta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    correcta: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Respuesta', respuestaSchema);