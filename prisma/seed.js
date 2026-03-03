const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { slug: 'coiffure', nom: 'Coiffure', description: 'Tresses, locks, tissages et soins capillaires', icon: '💄' },
    { slug: 'decoration', nom: 'Décoration', description: 'Décoration événementielle, mariages, galas', icon: '🌸' },
    { slug: 'restauration', nom: 'Restauration', description: 'Traiteur, buffets, cuisines africaines et internationales', icon: '🍽️' },
    { slug: 'cinematographie', nom: 'Cinématographie', description: 'Photo et vidéo professionnelle pour vos événements', icon: '🎬' },
    { slug: 'hotesses', nom: 'Hôtesses & Protocole', description: 'Hôtesses d\'accueil et protocole événementiel', icon: '👩‍💼' },
    { slug: 'billetterie', nom: 'Billetterie', description: 'Organisation et gestion de vos événements', icon: '🎟️' },
    { slug: 'maquillage', nom: 'Maquillage / Beauté', description: 'Maquillage professionnel, soins visage et beauté', icon: '💅' },
    { slug: 'manucure', nom: 'Manucure / Pédicure', description: 'Ongles, nail art, soins des mains et pieds', icon: '✨' },
    { slug: 'sonorisation', nom: 'Sonorisation / DJ', description: 'Sono, éclairage, DJ pour vos soirées et événements', icon: '🎵' },
    { slug: 'mc', nom: 'Maître de cérémonie', description: 'Animation et maîtrise de vos cérémonies', icon: '🎤' },
    { slug: 'autre', nom: 'Autre', description: 'Autres services événementiels', icon: '🌟' },
  ];

  for (const categorie of categories) {
    await prisma.categorie.upsert({
      where: { slug: categorie.slug },
      update: {},
      create: categorie,
    });
  }

  console.log('✅ Catégories insérées avec succès !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());