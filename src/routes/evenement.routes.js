const express = require('express');
const router = express.Router();
const { getEvenements, getEvenementById, creerEvenement } = require('../controllers/evenementController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', getEvenements);
router.get('/:id', getEvenementById);
router.post('/', verifyToken, creerEvenement);

module.exports = router;