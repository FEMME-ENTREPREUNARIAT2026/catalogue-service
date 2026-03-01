const express = require('express');
const router = express.Router();
const { getPrestations, getPrestationById, creerPrestation, modifierPrestation, supprimerPrestation, ajouterPhotos } = require('../controllers/prestationController');
const { verifyPrestataire } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.get('/', getPrestations);
router.get('/:id', getPrestationById);
router.post('/', verifyPrestataire, creerPrestation);
router.put('/:id', verifyPrestataire, modifierPrestation);
router.delete('/:id', verifyPrestataire, supprimerPrestation);
router.post('/:id/photos', verifyPrestataire, upload.array('photos', 5), ajouterPhotos);

module.exports = router;