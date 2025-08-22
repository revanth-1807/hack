const mongoose = require('mongoose');

async function fixDatabaseIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/smart-campus');
        console.log('Connected to MongoDB');

        // Get the users collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // List all indexes
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', indexes);

        // Check if username index exists and drop it
        const usernameIndex = indexes.find(index => index.name === 'username_1');
        if (usernameIndex) {
            console.log('Found problematic username index, dropping it...');
            await usersCollection.dropIndex('username_1');
            console.log('Username index dropped successfully');
        } else {
            console.log('No username index found');
        }

        // List indexes again to confirm
        const updatedIndexes = await usersCollection.indexes();
        console.log('Updated indexes:', updatedIndexes);

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error fixing database index:', error);
        process.exit(1);
    }
}

fixDatabaseIndex();
