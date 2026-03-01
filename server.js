const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categorieRoutes = require('./src/routes/categorie.routes');
const boutiqueRoutes = require('./src/routes/boutique.routes');
const prestationRoutes = require('./src/routes/prestation.routes');
const evenementRoutes = require('./src/routes/evenement.routes');
const searchRoutes = require('./src/routes/search.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/categories', categorieRoutes);
app.use('/boutiques', boutiqueRoutes);
app.use('/prestations', prestationRoutes);
app.use('/evenements', evenementRoutes);
app.use('/search', searchRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'catalogue-service fonctionne !' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`catalogue-service actif sur le port ${PORT}`);
});
