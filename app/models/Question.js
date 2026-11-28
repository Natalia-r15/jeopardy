const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: [true, 'El texto de la pregunta es obligatorio'],
        trim: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    dificultad: {
        type: String,
        enum: {
            values: ['facil', 'media', 'dificil', 'experta'],
            message: 'Dificultad no válida, solo facil, media, dificil o experta.'
        },
        required: true
    },
    puntos: {
        type: Number,
        required: true,
        min: [100, 'Los puntos deben ser al menos 100']
    },
    isRevealed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);