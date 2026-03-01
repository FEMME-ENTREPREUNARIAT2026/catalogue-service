const express = require('express');
const router = express.Router();
const { getCategories, getCategorieBySlug } = require('../controllers/categorieController');

router.get('/', getCategories);
router.get('/:slug', getCategorieBySlug);

module.exports = router;