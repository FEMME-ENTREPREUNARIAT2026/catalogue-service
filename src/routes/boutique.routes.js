const express = require('express');
const router = express.Router();
const { getBoutiques, getBoutiqueById, creerBoutique, modifierBoutique, ajouterPhotosBoutique } = require('../controllers/boutiqueController');
const { verifyPrestataire } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.get('/', getBoutiques);
router.get('/:id', getBoutiqueById);
router.post('/', verifyPrestataire, creerBoutique);
router.put('/:id', verifyPrestataire, modifierBoutique);
router.post('/:id/photos', verifyPrestataire, upload.array('photos', 5), ajouterPhotosBoutique);

module.exports = router;