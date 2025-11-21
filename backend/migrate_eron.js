// migrate_eron.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Même URL que pour migrate_messi
const MONGO_URL = "mongodb://localhost:27017/easypadel";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connecté à MongoDB");

    // 1. Chercher le user 'eron'
    const user = await User.findOne({ username: "eron" });
    if (!user) {
      console.log("❌ Aucun user 'eron' trouvé");
      process.exit(0);
    }
    console.log("🔎 User trouvé :", user._id.toString());

    // 2. Nouveau mot de passe en clair
    const plainPassword = "1234"; // 👈 c'est celui que tu utiliseras pour te connecter

    // 3. Générer le hash
    const hash = await bcrypt.hash(plainPassword, 10);
    console.log("🔐 Nouveau passwordHash :", hash);

    // 4. Mettre à jour le user : ajouter passwordHash et supprimer password
    const result = await User.updateOne(
      { _id: user._id },
      {
        $set: { passwordHash: hash },
        $unset: { password: "" }, // supprime le champ password
      }
    );

    console.log("🎉 Mot de passe hashé pour eron !");
    console.log(result);

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur migration eron :", err);
    process.exit(1);
  }
}

run();
