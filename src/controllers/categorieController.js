const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      include: {
        _count: {
          select: { boutiques: true, prestations: true }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getCategorieBySlug = async (req, res) => {
  try {
    const categorie = await prisma.categorie.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: {
          select: { boutiques: true, prestations: true }
        }
      }
    });

    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }

    res.json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getCategories, getCategorieBySlug };