require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRoute = require('./routes/users');
const terrainsRoute = require('./routes/terrains');
const reservationsRoute = require('./routes/reservations');
const creneauxRoute = require('./routes/creneaux'); // en haut

const app = express();
app.use(cors());
app.use(express.json()); // ← AVANT les routes

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/easypadel')
  .then(() => console.log(' Connecté à MongoDB'))
  .catch(err => console.error(' Erreur MongoDB :', err.message));

app.use('/api/users', usersRoute);
app.use('/api/terrains', terrainsRoute);
app.use('/api/reservations', reservationsRoute);
app.use('/api/creneaux', creneauxRoute); //test

app.get('/', (_req, res) => res.send('API easypadel fonctionne test v1'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API prête sur http://0.0.0.0:${PORT}`));

/**require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRoute = require('./routes/users');
const terrainsRoute = require('./routes/terrains');
const reservationsRoute = require('./routes/reservations');
const creneauxRoute = require('./routes/creneaux');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/easypadel')
  .then(() => console.log(' Connecté à MongoDB'))
  .catch(err => console.error(' Erreur MongoDB :', err.message));

app.use('/api/users', usersRoute);
app.use('/api/terrains', terrainsRoute);
app.use('/api/reservations', reservationsRoute);
app.use('/api/creneaux', creneauxRoute);   

app.get('/', (_req, res) => res.send('API easypadel fonctionne !'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(` API prête sur http://0.0.0.0:${PORT}`));*/
