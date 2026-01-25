/**
 * CineBook Database Seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CineBook database...\n');

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cinebook.com' },
    update: {},
    create: {
      email: 'admin@cinebook.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('  ✓ Admin user created');

  // Create sample movies
  console.log('\nCreating movies...');
  const movies = await Promise.all([
    prisma.movie.upsert({
      where: { slug: 'inception-2024' },
      update: {},
      create: {
        title: 'Inception',
        slug: 'inception-2024',
        description: 'A thief who steals corporate secrets through dream-sharing technology.',
        duration: 148,
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        language: 'English',
        releaseDate: new Date('2024-01-15'),
        rating: 8.8,
        certificate: 'UA',
        director: 'Christopher Nolan',
        posterUrl: 'https://example.com/inception.jpg',
      },
    }),
    prisma.movie.upsert({
      where: { slug: 'the-dark-knight' },
      update: {},
      create: {
        title: 'The Dark Knight',
        slug: 'the-dark-knight',
        description: 'Batman faces the Joker in Gotham City.',
        duration: 152,
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        releaseDate: new Date('2024-02-01'),
        rating: 9.0,
        certificate: 'UA',
        director: 'Christopher Nolan',
        posterUrl: 'https://example.com/dark-knight.jpg',
      },
    }),
    prisma.movie.upsert({
      where: { slug: 'dune-part-two' },
      update: {},
      create: {
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        description: 'Paul Atreides unites with the Fremen to avenge his family.',
        duration: 166,
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        releaseDate: new Date('2024-03-01'),
        rating: 8.5,
        certificate: 'UA',
        director: 'Denis Villeneuve',
        posterUrl: 'https://example.com/dune2.jpg',
      },
    }),
  ]);
  console.log(`  ✓ ${movies.length} movies created`);

  // Create theaters
  console.log('\nCreating theaters...');
  const theater = await prisma.theater.upsert({
    where: { slug: 'pvr-phoenix-bangalore' },
    update: {},
    create: {
      name: 'PVR Phoenix',
      slug: 'pvr-phoenix-bangalore',
      address: 'Phoenix Marketcity, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      phone: '+91-9876543210',
      facilities: ['Parking', 'Food Court', 'Wheelchair Access', 'Dolby Atmos'],
    },
  });
  console.log('  ✓ Theater created');

  // Create screens with seats
  console.log('\nCreating screens...');
  const screen = await prisma.screen.upsert({
    where: { theaterId_name: { theaterId: theater.id, name: 'Screen 1' } },
    update: {},
    create: {
      theaterId: theater.id,
      name: 'Screen 1',
      screenType: 'IMAX',
      totalSeats: 100,
      rowCount: 10,
      columnCount: 10,
    },
  });

  // Create seats
  const existingSeats = await prisma.seat.count({ where: { screenId: screen.id } });
  if (existingSeats === 0) {
    console.log('  Creating seats...');
    const rows = 'ABCDEFGHIJ';
    const seats = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 1; c <= 10; c++) {
        seats.push({
          screenId: screen.id,
          row: rows[r],
          number: c,
          seatType: r < 2 ? 'REGULAR' : r >= 8 ? 'PREMIUM' : 'REGULAR',
        });
      }
    }
    await prisma.seat.createMany({ data: seats });
    console.log('  ✓ 100 seats created');
  }

  // Create shows
  console.log('\nCreating shows...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const showTimes = [
    { hour: 10, minute: 0 },
    { hour: 14, minute: 30 },
    { hour: 18, minute: 0 },
    { hour: 21, minute: 30 },
  ];

  for (const movie of movies) {
    for (const time of showTimes) {
      const startTime = new Date(tomorrow);
      startTime.setHours(time.hour, time.minute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + movie.duration + 15);

      const existingShow = await prisma.show.findFirst({
        where: { movieId: movie.id, screenId: screen.id, startTime },
      });

      if (!existingShow) {
        const show = await prisma.show.create({
          data: {
            movieId: movie.id,
            screenId: screen.id,
            showDate: tomorrow,
            startTime,
            endTime,
            status: 'OPEN_FOR_BOOKING',
          },
        });

        // Create show seats with pricing
        const seats = await prisma.seat.findMany({ where: { screenId: screen.id } });
        const showSeats = seats.map((seat) => ({
          showId: show.id,
          seatId: seat.id,
          price: seat.seatType === 'PREMIUM' ? 350 : 250,
          status: 'AVAILABLE',
        }));
        await prisma.showSeat.createMany({ data: showSeats });
      }
    }
  }
  console.log('  ✓ Shows created for tomorrow');

  console.log('\n════════════════════════════════════════');
  console.log('  ✅ Seed completed successfully!');
  console.log('════════════════════════════════════════');
  console.log('\n  Admin Login:');
  console.log('  Email:    admin@cinebook.com');
  console.log('  Password: Admin@123');
  console.log('════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
