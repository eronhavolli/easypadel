require('dotenv').config({ path: '../.env' }); // Adjust path to .env if needed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Terrain = require('../models/Terrain');

const seedData = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo:27017/easypadel';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Terrain.deleteMany({});
        console.log('Cleared existing users and terrains');

        // Create Users
        const passwordHashAdmin = await bcrypt.hash('1234', 10);
        const passwordHashUser1 = await bcrypt.hash('goat', 10);
        const passwordHashUser2 = await bcrypt.hash('password123', 10);

        const users = [
            {
                username: 'admin',
                email: 'admin@easypadel.com',
                passwordHash: passwordHashAdmin,
                role: 'admin'
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                passwordHash: passwordHashUser1,
                role: 'user'
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                passwordHash: passwordHashUser2,
                role: 'user'
            }
        ];
        await User.insertMany(users);
        console.log(`Seeded ${users.length} users`);

        // Create Terrains
        const terrains = [
            { nom: 'Terrain A', dispo: true },
            { nom: 'Terrain B', dispo: true },
            { nom: 'Terrain C', dispo: false },
            { nom: 'Terrain D', dispo: true }
        ];

        await Terrain.insertMany(terrains);
        console.log(`Seeded ${terrains.length} terrains`);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
