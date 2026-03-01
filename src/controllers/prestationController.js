const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const getPrestations = async (req, res) => {
  const { categorie, ville, prixMax, sort } = req.query;

  const where = { disponible: true };

  if (categorie) {
    where.categorie = { slug: categorie };
  }
  if (ville) {
    where.boutique = { ville: { contains: ville, mode: 'insensitive' } };
  }
  if (prixMax) {
    where.prix = { lte: parseFloat(prixMax) };
  }

  const orderBy = sort === 'recents'
    ? { createdAt: 'desc' }
    : { vues: 'desc' };

  try {
    const prestations = await prisma.prestation.findMany({
      where,
      orderBy,
      include: {
        boutique: {
          select: { id: true, nom: true, ville: true, noteMoyenne: true, badge: true }
        },
        categorie: {
          select: { nom: true, slug: true }
        }
      }
    });
    res.json(prestations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getPrestationById = async (req, res) => {
  try {
    const prestation = await prisma.prestation.findUnique({
      where: { id: req.params.id },
      include: {
        boutique: {
          select: { id: true, nom: true, ville: true, noteMoyenne: true, badge: true, photos: true }
        },
        categorie: {
          select: { nom: true, slug: true }
        }
      }
    });

    if (!prestation) {
      return res.status(404).json({ message: 'Prestation introuvable' });
    }

    await prisma.prestation.update({
      where: { id: req.params.id },
      data: { vues: { increment: 1 } }
    });

    res.json(prestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const creerPrestation = async (req, res) => {
  const { titre, description, prix, duree, caracteristiques, categorieId } = req.body;

  if (!titre || !prix || !categorieId) {
    return res.status(400).json({ message: 'titre, prix et categorieId sont obligatoires' });
  }

  try {
    const boutique = await prisma.boutique.findFirst({
      where: { prestataireId: req.user.userId }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Vous devez d\'abord créer votre boutique' });
    }

    const prestation = await prisma.prestation.create({
      data: {
        titre,
        description: description || null,
        prix: parseFloat(prix),
        duree: duree || null,
        caracteristiques: caracteristiques || null,
        boutiqueId: boutique.id,
        categorieId,
        photos: [],
      }
    });

    res.status(201).json(prestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const modifierPrestation = async (req, res) => {
  const { titre, description, prix, duree, caracteristiques, disponible } = req.body;

  try {
    const prestation = await prisma.prestation.findUnique({
      where: { id: req.params.id },
      include: { boutique: true }
    });

    if (!prestation) {
      return res.status(404).json({ message: 'Prestation introuvable' });
    }

    if (prestation.boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos prestations' });
    }

    const prestationModifiee = await prisma.prestation.update({
      where: { id: req.params.id },
      data: {
        titre: titre || prestation.titre,
        description: description || prestation.description,
        prix: prix ? parseFloat(prix) : prestation.prix,
        duree: duree || prestation.duree,
        caracteristiques: caracteristiques || prestation.caracteristiques,
        disponible: disponible !== undefined ? disponible : prestation.disponible,
      }
    });

    res.json(prestationModifiee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const supprimerPrestation = async (req, res) => {
  try {
    const prestation = await prisma.prestation.findUnique({
      where: { id: req.params.id },
      include: { boutique: true }
    });

    if (!prestation) {
      return res.status(404).json({ message: 'Prestation introuvable' });
    }

    if (prestation.boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos prestations' });
    }

    await prisma.prestation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Prestation supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const ajouterPhotos = async (req, res) => {
  const { uploadImage } = require('../utils/cloudinary');

  try {
    const prestation = await prisma.prestation.findUnique({
      where: { id: req.params.id },
      include: { boutique: true }
    });

    if (!prestation) {
      return res.status(404).json({ message: 'Prestation introuvable' });
    }

    if (prestation.boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const urls = [];
    for (const file of req.files) {
      const url = await uploadImage(file.buffer);
      urls.push(url);
    }

    const prestationMiseAJour = await prisma.prestation.update({
      where: { id: req.params.id },
      data: { photos: { push: urls } }
    });

    res.json(prestationMiseAJour);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getPrestations,
  getPrestationById,
  creerPrestation,
  modifierPrestation,
  supprimerPrestation,
  ajouterPhotos
};