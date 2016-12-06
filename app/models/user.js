'use strict'

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
   const Schema = mongoose.Schema;
// Se define el esquema para el usuario
const userSchema = mongoose.Schema({
  local        : {
    email      : { type: String, unique: true },
    password   : String,
  },
  facebook     : {
    id         : String,
    token      : String,
    email      : String,
    name       : String
  },
  twitter      : {
    id         : String,
    token      : String,
    displayName: String,
    username   : String
  },
  google       : {
    id         : String,
    token      : String,
    email      : String,
    name       : String
  },
  noticiasGuardadas: [{
    type: Schema.Types.ObjectId,
    ref: 'Noticia'
  }],
});

// Metodo para generar un hash para el password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Metodo para validad el password, recordar que el password se guarda encriptado
// y ya no se puede desencriptar
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// Se deja el esquema visible a la aplicacion
module.exports = mongoose.model('User', userSchema);
