const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const getEvenements = async (req, res) => {
  const { ville, upcoming } = req.query;

  const where = {};

  if (ville) {
    where.lieu = { contains: ville, mode: 'insensitive' };
  }
  if (upcoming === 'true') {
    where.date = { gte: new Date() };
  }

  try {
    const evenements = await prisma.evenement.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    res.json(evenements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getEvenementById = async (req, res) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: req.params.id }
    });

    if (!evenement) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    res.json(evenement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const creerEvenement = async (req, res) => {
  const { titre, description, date, heure, lieu, prix, capacite, tags } = req.body;

  if (!titre || !date || !lieu) {
    return res.status(400).json({ message: 'titre, date et lieu sont obligatoires' });
  }

  try {
    const evenement = await prisma.evenement.create({
      data: {
        titre,
        description: description || null,
        date: new Date(date),
        heure: heure || null,
        lieu,
        prix: prix || 'Gratuit',
        capacite: capacite || null,
        organisateurId: req.user.userId,
        tags: tags || [],
      }
    });

    res.status(201).json(evenement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getEvenements, getEvenementById, creerEvenement };