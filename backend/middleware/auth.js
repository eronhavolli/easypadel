const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("⚠️ JWT_SECRET manquant dans .env !");
}

/**
 * Middleware d'authentification :
 * - lit le header Authorization: Bearer <token>
 * - vérifie le token
 * - met req.user = { userId, role } si OK
 */
function auth(req, res, next) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (e) {
    console.error("Erreur vérif JWT:", e.message);
    return res.status(401).json({ message: "Token invalide" });
  }
}

/**
 * Middleware d'autorisation admin :
 * - nécessite que auth ait déjà été appelé
 * - vérifie req.user.role === "admin"
 */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé aux admins" });
  }
  next();
}

module.exports = { auth, adminOnly };
