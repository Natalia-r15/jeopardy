"use strict";

const utils = require('./utils');

class QuestionException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Question {
    constructor(texto, categoria, dificultad, puntos) {
        this._id = utils.generateUUID();
        this.texto = texto;
        this.categoria = categoria;
        this.dificultad = dificultad;
        this.puntos = puntos;
        this._isRevealed = false;
    }

    get id() { return this._id; }
    get texto() { return this._texto; }
    get categoria() { return this._categoria; }
    get dificultad() { return this._dificultad; }
    get puntos() { return this._puntos; }
    get isRevealed() { return this._isRevealed; }

    set id(value) { throw new QuestionException("El ID se genera automáticamente."); }

    set texto(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new QuestionException("El texto de la pregunta no puede estar vacío.");
        }
        this._texto = value.trim();
    }

    set categoria(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new QuestionException("La categoría no puede estar vacía.");
        }
        this._categoria = value.trim();
    }

    set dificultad(value) {
        const validas = ["facil", "media", "dificil","experta"];
        if (!validas.includes(value.toLowerCase())) {
            throw new QuestionException(`Dificultad no válida. Debe ser: ${validas.join(", ")}`);
        }
        this._dificultad = value.toLowerCase();
    }

    set puntos(value) {
        if (typeof value !== "number" || value <= 0 || value % 100 !== 0) {
            throw new QuestionException("Los puntos deben ser un número mayor a 0 y múltiplo de 100.");
        }
        this._puntos = value;
    }

    set isRevealed(value) {
        if (typeof value !== "boolean") {
            throw new QuestionException("El estado de revelado debe ser true o false.");
        }
        this._isRevealed = value;
    }

    static createFromObject(obj) {
        let newObj = {};
        const mapping = { 'id': '_id', 'texto': '_texto', 'categoria': '_categoria', 'dificultad': '_dificultad', 'puntos': '_puntos', 'isRevealed': '_isRevealed' };
        
        for (let key in obj) {
            const newKey = mapping[key] || key;
            newObj[newKey] = obj[key];
        }
        
        Question.cleanObject(newObj);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!newObj._id || !uuidRegex.test(newObj._id)) {
            newObj._id = utils.generateUUID();
        }

        let question = Object.create(Question.prototype);
        question._id = newObj._id;
        question._texto = newObj._texto || "Sin texto";
        question._categoria = newObj._categoria || "";
        question._dificultad = newObj._dificultad || "medio";
        question._puntos = typeof newObj._puntos === 'number' ? newObj._puntos : 100;
        question._isRevealed = newObj._isRevealed === true;
        return question;
    }

    static cleanObject(obj) {
        const validProps = ["_id", "_texto", "_categoria", "_dificultad", "_puntos", "_isRevealed"];
        for (let prop in obj) {
            if (!validProps.includes(prop)) {
                delete obj[prop];
            }
        }
    }

    toObject() {
        return { 
            id: this._id, 
            texto: this._texto, 
            categoria: this._categoria, 
            dificultad: this._dificultad, 
            puntos: this._puntos, 
            isRevealed: this._isRevealed 
        };
    }
}

module.exports = Question;