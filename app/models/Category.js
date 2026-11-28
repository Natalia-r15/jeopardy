const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true, // No puede haber dos categorías con el mismo nombre
        trim: true,
        maxlength: [30, 'El nombre no puede superar los 30 caracteres']
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);