const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User");

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    // Vérifier si user existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier password avec passwordHash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Succès
    res.json({
      message: "Connexion réussie",
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

// POST /api/users/login
/**router.post('/login', async (req, res) => {
  try {
    // Accepte les deux formats d'entrée pour éviter toute confusion
    const username = (req.body.username || req.body.identifiant || '').trim();
    const password = (req.body.password || req.body.motdepasse || '').trim();

    if (!username || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const user = await User.findOne({ username }).lean();
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    return res.json({
      message: 'Connexion réussie',
      userId: String(user._id),
      username: user.username,  // toujours "username" dans la réponse
      role: user.role || 'user',
    });
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

*/

/**const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();


 * POST /api/users/login
 * body: { identifiant, motdepasse }   // (= "mot de passe" dans ton tableau)
 * 200 { message:"Connexion réussie", userId }
 * 400 Champs manquants
 * 401 Identifiants incorrects
 * 500 Erreur serveur
 
router.post('/login',
  body('identifiant').isString().notEmpty(),
  body('motdepasse').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: 'Champs manquants' });

      const { identifiant, motdepasse } = req.body;
      const user = await User.findOne({ username: identifiant }).lean();
      if (!user || user.password !== motdepasse)
        return res.status(401).json({ message: 'Identifiants incorrects' });

      return res.status(200).json({ message: 'Connexion réussie', userId: user._id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

module.exports = router;
*/