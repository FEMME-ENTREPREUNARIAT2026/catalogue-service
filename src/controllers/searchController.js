const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const search = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Paramètre q obligatoire' });
  }

  try {
    const [prestations, boutiques] = await Promise.all([
      prisma.prestation.findMany({
        where: {
          disponible: true,
          OR: [
            { titre: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ]
        },
        include: {
          boutique: { select: { id: true, nom: true, ville: true } }
        },
        take: 5
      }),
      prisma.boutique.findMany({
        where: {
          OR: [
            { nom: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5
      })
    ]);

    res.json({ prestations, boutiques });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { search };