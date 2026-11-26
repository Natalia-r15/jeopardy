"use strict";

const utils = require('./utils');

class RespuestaException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Respuesta {
    constructor(preguntaId, texto, correcta) {
        this._id = utils.generateUUID();
        this.preguntaId = preguntaId;
        this.texto = texto;
        this.correcta = correcta;
    }

    get id() { return this._id; }
    get preguntaId() { return this._preguntaId; }
    get texto() { return this._texto; }
    get correcta() { return this._correcta; }

    set id(value) {
        throw new RespuestaException("El ID de la respuesta se genera automáticamente.");
    }

    set preguntaId(value) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw new RespuestaException("El preguntaId debe ser un UUID válido.");
        }
        this._preguntaId = value;
    }

    set texto(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new RespuestaException("El texto de la respuesta no puede estar vacío.");
        }
        this._texto = value.trim();
    }

    set correcta(value) {
        if (typeof value !== "boolean") {
            throw new RespuestaException("El campo 'correcta' debe ser true o false.");
        }
        this._correcta = value;
    }

    static createFromObject(obj) {
        let newObj = {};
        const mapping = { 'id': '_id', 'preguntaId': '_preguntaId', 'texto': '_texto', 'correcta': '_correcta' };
        
        for (let key in obj) {
            const newKey = mapping[key] || key;
            newObj[newKey] = obj[key];
        }
        
        Respuesta.cleanObject(newObj);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!newObj._id || !uuidRegex.test(newObj._id)) {
            newObj._id = utils.generateUUID();
        }

        let respuesta = Object.create(Respuesta.prototype);
        respuesta._id = newObj._id;
        respuesta._preguntaId = newObj._preguntaId || "";
        respuesta._texto = newObj._texto || "Sin respuesta";
        respuesta._correcta = newObj._correcta === true;
        return respuesta;
    }

    static cleanObject(obj) {
        const validProps = ["_id", "_preguntaId", "_texto", "_correcta"];
        for (let prop in obj) {
            if (!validProps.includes(prop)) {
                delete obj[prop];
            }
        }
    }

    toObject() {
        return { id: this._id, preguntaId: this._preguntaId, texto: this._texto, correcta: this._correcta };
    }
}

module.exports = Respuesta;