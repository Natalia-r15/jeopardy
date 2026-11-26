"use strict";

const utils = require('./utils');

class CategoryException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Category {
    constructor(nombre) {
        this._id = utils.generateUUID();
        this.nombre = nombre;
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }

    set id(value) {
        throw new CategoryException("El ID de la categoría se genera automáticamente.");
    }

    set nombre(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new CategoryException("El nombre de la categoría no puede estar vacío.");
        }
        if (value.trim().length > 30) {
            throw new CategoryException("El nombre de la categoría no puede superar los 30 caracteres.");
        }
        this._nombre = value.trim();
    }

    static createFromObject(obj) {
        let newObj = {};
        const mapping = { 'id': '_id', 'nombre': '_nombre' };
        
        for (let key in obj) {
            const newKey = mapping[key] || key;
            newObj[newKey] = obj[key];
        }
        
        Category.cleanObject(newObj);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!newObj._id || !uuidRegex.test(newObj._id)) {
            newObj._id = utils.generateUUID();
        }

        let category = Object.create(Category.prototype);
        category._id = newObj._id;
        category._nombre = newObj._nombre || "Sin nombre";
        return category;
    }

    static cleanObject(obj) {
        const validProps = ["_id", "_nombre"];
        for (let prop in obj) {
            if (!validProps.includes(prop)) {
                delete obj[prop];
            }
        }
    }

    toObject() {
        return { id: this._id, nombre: this._nombre };
    }
}

module.exports = Category;