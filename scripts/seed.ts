import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/db/mongodb';
import Room from '../src/models/Room';
import User from '../src/models/User';
import Booking from '../src/models/Booking';

const mockRooms = [
  {
    name: 'Cozy Garden Suite',
    description: 'A peaceful retreat with garden views and modern amenities. Perfect for couples seeking a quiet getaway.',
    price: 1500000,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'AC', 'Breakfast', 'Garden View'],
    available: true,
  },
  {
    name: 'Modern Loft Apartment',
    description: 'Centrally located loft with industrial design. High ceilings and plenty of natural light.',
    price: 2500000,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 3,
    amenities: ['Wifi', 'AC', 'Kitchen', 'Workspace'],
    available: true,
  },
  {
    name: 'Seaside Villa',
    description: 'Stunning villa just steps away from the beach. Features a private pool and spacious deck.',
    price: 6500000,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 6,
    amenities: ['Wifi', 'AC', 'Private Pool', 'Ocean View', 'Kitchen'],
    available: true,
  },
  {
    name: 'Mountain Cabin',
    description: 'Rustic cabin with cozy fireplace. Ideal for hiking enthusiasts and nature lovers.',
    price: 1800000,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1449156001533-cb39c7160759?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 4,
    amenities: ['Wifi', 'Fireplace', 'Mountain View', 'Hiking Trails'],
    available: true,
  },
  {
    name: 'Urban Studio',
    description: 'Sleek studio in the heart of the city. Close to main attractions and public transport.',
    price: 1200000,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'AC', 'Gym Access', 'City View'],
    available: true,
  },
  {
    name: 'Heritage Home',
    description: 'Classic architecture meets modern comfort in this beautifully restored heritage house.',
    price: 2200000,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 5,
    amenities: ['Wifi', 'AC', 'Breakfast Included', 'Historical District'],
    available: true,
  }
];

const mockUsers = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123' // Will be hashed
  },
  {
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    password: 'user123' // Will be hashed
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Cleaning up collections...');
    await Room.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});

    console.log('Seeding Users (with hashed passwords)...');
    // Hash passwords before inserting
    const usersWithHashedPasswords = await Promise.all(
      mockUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Created ${createdUsers.length} users:`);
    mockUsers.forEach((u) => console.log(`  - ${u.email} / ${u.password}`));

    console.log('Seeding Rooms...');
    const createdRooms = await Room.insertMany(mockRooms);
    console.log(`Created ${createdRooms.length} rooms.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
