const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Terrain = require('../models/Terrain'); // 👈 pour le /all (admin)

const router = express.Router();

/**
 * POST /api/reservations
 * body: { terrainId, date, userId, heure }
 * 201: { message:"Réservation OK", reservationId }
 * 400: Champs manquants
 * 400: Créneau déjà pris
 * 400: Vous avez déjà réservé ce créneau
 * 401: Non authentifié (userId inconnu)
 * 500: Erreur serveur
 */
router.post(
  '/',
  body('terrainId').isString().notEmpty(),
  body('userId').isString().notEmpty(),
  body('date').isString().notEmpty(),
  body('heure').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors =', errors.array());
        return res.status(400).json({ message: 'Champs manquants' });
      }

      const { terrainId, date, userId, heure } = req.body;

      // 401 si l'utilisateur n'existe pas
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // 1) Est-ce que ce user a déjà réservé ce créneau ?
      const userReservation = await Reservation.findOne({
        terrainId,
        date,
        heure,
        userId,
      }).lean();

      if (userReservation) {
        return res
          .status(400)
          .json({ message: 'Vous avez déjà réservé ce créneau' });
      }

      // 2) Sinon : est-ce que le créneau est pris par quelqu'un d'autre 
      const dup = await Reservation.findOne({ terrainId, date, heure }).lean();
      if (dup) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }

      // 3) OK, on crée la réservation
      const r = await Reservation.create({ terrainId, date, userId, heure });
      return res
        .status(201)
        .json({ message: 'Réservation OK', reservationId: r._id });
    } catch (e) {
      // Si index unique en base → code 11000
      if (e?.code === 11000) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/**
 * GET /api/reservations?userId=...
 * -> Mes réservations (pour l'écran "Mes réservations")
 * renvoie : [{ _id, terrainId, date, heure }, ...]
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ message: 'Paramètre userId obligatoire' });
    }

    const list = await Reservation.find({ userId }).lean();

    const result = list.map((r) => ({
      _id: r._id,
      terrainId: String(r.terrainId),
      date: r.date,
      heure: r.heure,
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur GET /api/reservations :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/reservations/all
 * -> Vue admin : toutes les réservations
 * renvoie : [{ _id, user, terrain, date, heure }, ...]
 */
router.get('/all', async (_req, res) => {
  try {
    const list = await Reservation.find()
      .populate('userId', 'username')     // nécessite que Reservation.userId ait ref: 'User'
      .populate('terrainId', 'nom')       // nécessite que Reservation.terrainId ait ref: 'Terrain'
      .lean();

    const result = list.map((r) => ({
      _id: r._id,
      user: r.userId?.username || String(r.userId),
      terrain: r.terrainId?.nom || String(r.terrainId),
      date: r.date,
      heure: r.heure,
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur GET /api/reservations/all :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

/**const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/reservations
 * body: { terrainId, date, userId, heure }
 * 201: { message:"Réservation OK", reservationId }
 * 400: Champs manquants
 * 400: Créneau déjà pris
 * 400: Vous avez déjà réservé ce créneau
 * 401: Non authentifié (userId inconnu)
 * 500: Erreur serveur
 
router.post(
  '/',
  body('terrainId').isString().notEmpty(),
  body('userId').isString().notEmpty(),
  body('date').isString().notEmpty(),
  body('heure').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors =', errors.array());
        return res.status(400).json({ message: 'Champs manquants' });
      }

      const { terrainId, date, userId, heure } = req.body;

      // 401 si l'utilisateur n'existe pas
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // 1) Est-ce que ce user a déjà réservé ce créneau ?
      const userReservation = await Reservation.findOne({
        terrainId,
        date,
        heure,
        userId,
      }).lean();

      if (userReservation) {
        return res
          .status(400)
          .json({ message: 'Vous avez déjà réservé ce créneau' });
      }

      // 2) Sinon : est-ce que le créneau est pris par quelqu'un d'autre 
      const dup = await Reservation.findOne({ terrainId, date, heure }).lean();
      if (dup) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }

      // 3) OK, on crée la réservation
      const r = await Reservation.create({ terrainId, date, userId, heure });
      return res
        .status(201)
        .json({ message: 'Réservation OK', reservationId: r._id });
    } catch (e) {
      // Si index unique en base → code 11000
      if (e?.code === 11000) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
*/

/**const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/reservations
 * body: { terrainId, date, userId, heure }
 * 201: { message:"Réservation OK", reservationId }
 * 400: Champs manquants  | 400: Créneau déjà pris
 * 401: Non authentifié (userId inconnu)
 * 500: Erreur serveur
 
router.post(
  '/',
  body('terrainId').isString().notEmpty(),
  body('userId').isString().notEmpty(),
  body('date').isString().notEmpty(),
  body('heure').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Champs manquants' });
      }

      const { terrainId, date, userId, heure } = req.body;

      // 401 si l'utilisateur n'existe pas
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      // Vérifier si le créneau est déjà pris pour ce terrain / cette date / cette heure
      const dup = await Reservation.findOne({ terrainId, date, heure }).lean();
      if (dup) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }

      const r = await Reservation.create({ terrainId, date, userId, heure });
      return res
        .status(201)
        .json({ message: 'Réservation OK', reservationId: r._id });
    } catch (e) {
      // Si index unique en base → code 11000
      if (e?.code === 11000) {
        return res.status(400).json({ message: 'Créneau déjà pris' });
      }
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

/**
 * GET /api/reservations
 * - si ?userId=...  → réservations de cet utilisateur
 * - sinon          → toutes les réservations (utile pour l'admin)
 * renvoie : [{ id, terrain, user, date, heure }]
 
router.get('/', async (req, res) => {
  try {
    const filt = req.query.userId ? { userId: req.query.userId } : {};

    const reservations = await Reservation.find(filt)
      .populate('terrainId', 'nom')   // nom du terrain
      .populate('userId', 'username') // username (utile pour admin)
      .lean();

    const formatted = reservations.map((r) => ({
      id: r._id,
      terrain: r.terrainId?.nom ?? 'Inconnu',
      user: r.userId?.username ?? 'Inconnu',
      date: r.date,
      heure: r.heure,
    }));

    return res.status(200).json(formatted);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/reservations/all
 * - vue admin : toutes les réservations avec user + terrain
 
router.get('/all', async (_req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('userId', 'username')
      .populate('terrainId', 'nom')
      .lean();

    const result = reservations.map((r) => ({
      _id: r._id,
      user: r.userId?.username || 'inconnu',
      terrain: r.terrainId?.nom || 'inconnu',
      date: r.date,
      heure: r.heure,
    }));

    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
*/