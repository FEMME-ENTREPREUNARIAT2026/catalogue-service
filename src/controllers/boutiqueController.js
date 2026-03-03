const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const getBoutiques = async (req, res) => {
  const { categorie, ville, disponible, sort } = req.query;

  const where = {};

  if (categorie) {
    where.categorie = { slug: categorie };
  }
  if (ville) {
    where.ville = { contains: ville, mode: 'insensitive' };
  }
  if (disponible !== undefined) {
    where.disponible = disponible === 'true';
  }

  const orderBy = sort === 'recents'
    ? { createdAt: 'desc' }
    : { noteMoyenne: 'desc' };

  try {
    const boutiques = await prisma.boutique.findMany({
      where,
      orderBy,
      include: {
        categorie: { select: { nom: true, slug: true } },
        _count: { select: { prestations: true } }
      }
    });
    res.json(boutiques);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getBoutiqueById = async (req, res) => {
  try {
    const boutique = await prisma.boutique.findUnique({
      where: { id: req.params.id },
      include: {
        categorie: true,
        prestations: {
          where: { disponible: true },
          orderBy: { createdAt: 'desc' },
          take: 4
        }
      }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    res.json(boutique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const creerBoutique = async (req, res) => {
  const { nom, bio, ville, categorieId, tarifMin } = req.body;

  if (!nom || !ville || !categorieId) {
    return res.status(400).json({ message: 'nom, ville et categorieId sont obligatoires' });
  }

  try {
    const dejaUneBoutique = await prisma.boutique.findFirst({
      where: { prestataireId: req.user.userId }
    });

    if (dejaUneBoutique) {
      return res.status(400).json({ message: 'Vous avez déjà une boutique' });
    }

    const boutique = await prisma.boutique.create({
      data: {
        prestataireId: req.user.userId,
        nom,
        bio: bio || null,
        ville,
        categorieId,
        tarifMin: tarifMin || null,
      }
    });

    res.status(201).json(boutique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const modifierBoutique = async (req, res) => {
  const { nom, bio, ville, adresse, quartier, tarifMin, disponible } = req.body;

  try {
    const boutique = await prisma.boutique.findUnique({
      where: { id: req.params.id }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    if (boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre boutique' });
    }

    const boutiqueModifiee = await prisma.boutique.update({
      where: { id: req.params.id },
      data: {
        nom: nom || boutique.nom,
        bio: bio || boutique.bio,
        ville: ville || boutique.ville,
        adresse: adresse !== undefined ? adresse : boutique.adresse,
        quartier: quartier !== undefined ? quartier : boutique.quartier,
        tarifMin: tarifMin || boutique.tarifMin,
        disponible: disponible !== undefined ? disponible : boutique.disponible,
      }
    });

    res.json(boutiqueModifiee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const ajouterPhotosBoutique = async (req, res) => {
  const { uploadImage } = require('../utils/cloudinary');

  try {
    const boutique = await prisma.boutique.findUnique({
      where: { id: req.params.id }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    if (boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const urls = [];
    for (const file of req.files) {
      const url = await uploadImage(file.buffer);
      urls.push(url);
    }

    const boutiqueModifiee = await prisma.boutique.update({
      where: { id: req.params.id },
      data: { photos: { push: urls } }
    });

    res.json(boutiqueModifiee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const mettreAJourAvatar = async (req, res) => {
  const { uploadImage } = require('../utils/cloudinary');

  if (!req.file) {
    return res.status(400).json({ message: 'Image obligatoire' });
  }

  try {
    const boutique = await prisma.boutique.findUnique({
      where: { id: req.params.id }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    if (boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const url = await uploadImage(req.file.buffer);

    const boutiqueModifiee = await prisma.boutique.update({
      where: { id: req.params.id },
      data: { avatar: url }
    });

    res.json(boutiqueModifiee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const mettreAJourCouverture = async (req, res) => {
  const { uploadImage } = require('../utils/cloudinary');

  if (!req.file) {
    return res.status(400).json({ message: 'Image obligatoire' });
  }

  try {
    const boutique = await prisma.boutique.findUnique({
      where: { id: req.params.id }
    });

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    if (boutique.prestataireId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const url = await uploadImage(req.file.buffer);

    const boutiqueModifiee = await prisma.boutique.update({
      where: { id: req.params.id },
      data: { photoCouverture: url }
    });

    res.json(boutiqueModifiee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Route interne : mise à jour de la note moyenne (appelée par booking-service)
const mettreAJourNoteMoyenne = async (req, res) => {
  const { noteMoyenne } = req.body;

  if (noteMoyenne === undefined || noteMoyenne === null) {
    return res.status(400).json({ message: 'noteMoyenne est obligatoire' });
  }

  try {
    const boutique = await prisma.boutique.update({
      where: { id: req.params.id },
      data: { noteMoyenne: parseFloat(noteMoyenne) },
    });
    res.json(boutique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getBoutiques, getBoutiqueById, creerBoutique, modifierBoutique, ajouterPhotosBoutique, mettreAJourAvatar, mettreAJourCouverture, mettreAJourNoteMoyenne };