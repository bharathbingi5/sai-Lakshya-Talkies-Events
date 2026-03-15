import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Room from '../models/Room.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }

    // Create rooms
    const roomsData = [
      {
        roomId: 'salaar-studio',
        name: 'The Salaar Studio',
        image: 'https://images.unsplash.com/photo-1595764430415-e21b43d28ff5?q=80&w=1400&auto=format&fit=crop',
        price: 4999,
        basePackage: 6,
        maxCapacity: 80,
        extraAdultCharge: 299,
        extraChildCharge: 199,
        description: 'Premium studio-style private theatre perfect for group celebrations and friends gatherings.',
        amenities: ['ac', 'projector', 'sound-system', 'lighting', 'seating']
      },
      {
        roomId: 'hitman-show',
        name: 'The Hitman Show',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1400&auto=format&fit=crop',
        price: 2999,
        basePackage: 4,
        maxCapacity: 50,
        extraAdultCharge: 199,
        extraChildCharge: 99,
        description: 'Best for small events and surprise celebrations.',
        amenities: ['ac', 'projector', 'sound-system', 'lighting']
      },
      {
        roomId: 'chhatrapathi-darbhar',
        name: 'The Chhatrapathi Shivaji Darbhar',
        image: 'https://images.unsplash.com/photo-1524492459426-030296340242?q=80&w=1400&auto=format&fit=crop',
        price: 14999,
        basePackage: 35,
        maxCapacity: 100,
        extraAdultCharge: 99,
        extraChildCharge: 99,
        description: 'Grand royal celebration hall ideal for big birthdays and large gatherings.',
        amenities: ['ac', 'projector', 'sound-system', 'lighting', 'seating', 'decoration']
      },
      {
        roomId: 'radhakrishna-bliss',
        name: 'Radhakrishna Bliss',
        image: 'https://images.unsplash.com/photo-1516589174184-c685266e48df?q=80&w=1400&auto=format&fit=crop',
        price: 1499,
        basePackage: 2,
        maxCapacity: 6,
        extraAdultCharge: 199,
        extraChildCharge: 99,
        description: 'Romantic couple-exclusive theatre designed for special moments.',
        amenities: ['ac', 'projector', 'sound-system', 'lighting', 'seating']
      }
    ];

    for (const roomData of roomsData) {
      const existingRoom = await Room.findOne({ roomId: roomData.roomId });
      if (!existingRoom) {
        await Room.create(roomData);
        console.log(`✅ Room ${roomData.name} created`);
      }
    }

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();