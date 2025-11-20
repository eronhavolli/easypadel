const express = require('express');
const Terrain = require('../models/Terrain');
const router = express.Router();

/**
 * GET /api/terrains
 * 200: [{ id, nom, dispo }]
 * 500: Erreur serveur
 */
router.get('/', async (_req, res) => {
  try {
    const terrains = await Terrain.find().lean();
    const out = terrains.map(t => ({ id: t._id, nom: t.nom}));
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
