const mongoose = require('mongoose');
const Book = require('../models/books.model');

async function updateBookQuantity() {
    try {
        // Kết nối database
        await mongoose.connect('mongodb+srv://coder:9gBohtaHyxhd7iUP@cluster0.frvqwl9.mongodb.net/collectionuser');
        console.log('Connected to MongoDB');

        // Cập nhật quantity = 100 cho tất cả sách
        const result = await Book.updateMany(
            {},  // Tìm tất cả sách
            { $set: { quantity: 100 } }  // Set quantity = 100
        );

        console.log(`Updated ${result.modifiedCount} books to have quantity = 100`);
        console.log('Update completed successfully');

    } catch (error) {
        console.error('Error updating books:', error);
    } finally {
        // Đóng kết nối database
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Chạy script
updateBookQuantity(); 