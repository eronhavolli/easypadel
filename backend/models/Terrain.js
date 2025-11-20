const mongoose = require('mongoose');

const terrainSchema = new mongoose.Schema({
  nom:   { type: String, required: true },
  dispo: { type: Boolean, default: true }
}, { collection: 'terrains' });

module.exports = mongoose.model('Terrain', terrainSchema);
