const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Terrain = require('../models/Terrain');

// GET /api/creneaux?terrainId=...&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { terrainId, date } = req.query;
    if (!terrainId || !date) {
      return res.status(400).json({ message: 'terrainId et date sont obligatoires' });
    }

    const terrain = await Terrain.findById(terrainId);
    if (!terrain) {
      return res.status(404).json({ message: 'Terrain non trouvé' });
    }

    const heures = ['16h-17h', '17h-18h', '18h-19h', '19h-20h', '20h-21h', '21h-22h'];

    const reservations = await Reservation.find({ terrainId, date });

    const slots = heures.map((h, index) => {
      const pris = reservations.some(r => r.heure === h);
      return {
        id: `${terrainId}`,           // ID UNIQUE par créneau
        nom: `${terrain.nom}`,          // "Terrain 1 - 16h-17h"
        heure: h,                              // heure simple
        dispo: !pris,
      };
    });

    res.json(slots);
  } catch (err) {
    console.error('Erreur /api/creneaux :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

/**const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Terrain = require('../models/Terrain');

// GET /api/creneaux?terrainId=...&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { terrainId, date } = req.query;
    if (!terrainId || !date) {
      return res.status(400).json({ message: 'terrainId et date sont obligatoires' });
    }

    const terrain = await Terrain.findById(terrainId);
    if (!terrain) {
      return res.status(404).json({ message: 'Terrain non trouvé' });
    }

    const heures = ['16h-17h', '17h-18h', '18h-19h', '19h-20h', '20h-21h', '21h-22h'];

    const reservations = await Reservation.find({ terrainId, date });

    const slots = heures.map(h => {
      const pris = reservations.some(r => r.heure === h);
      return {
        id: `${terrainId}`,
        nom: `${terrain.nom}`,
        heure : `${h}`, //test
        dispo: !pris
      };
    });

    res.json(slots);
  } catch (err) {
    console.error('Erreur /api/creneaux :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

*/