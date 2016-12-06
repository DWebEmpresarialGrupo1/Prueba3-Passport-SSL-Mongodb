'use strict'

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

// Se define el esquema para el usuario
const noticiaSchema = mongoose.Schema({
  titulo: {
    type: String,
    default: '',
    trim: true
  },
  cuerpo: {
    type: String,
    default: '',
    trim: true
  },
  imagen: {
    type: String,
    default: '',
    trim: true
  },
  url: {
    type: String,
    default: '',
    trim: true
  },
  fuente: {
    type: String,
    default: '',
    trim: true
  },
  autor: {
    type: String,
    default: '',
    trim: true
  },
  fecha: {
    type: String,
    default: '',
    trim: true
  },
});

// Se deja el esquema visible a la aplicacion
module.exports = mongoose.model('Noticia', noticiaSchema);
