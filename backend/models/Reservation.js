const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  terrainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Terrain', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: String, required: true },    // 'YYYY-MM-DD'
  heure:     { type: String, required: true }     // ex: '20h-21h'
}, { timestamps: true, collection: 'reservations' });

// empêche le doublon même terrain + même date + même heure
reservationSchema.index({ terrainId: 1, date: 1, heure: 1 }, { unique: true });

module.exports = mongoose.model('Reservation', reservationSchema);
