const mongoose = require('mongoose');
const Book = require('../models/books.model');

async function removeBookQuantity() {
    try {
        // Kết nối database
        await mongoose.connect('mongodb+srv://coder:9gBohtaHyxhd7iUP@cluster0.frvqwl9.mongodb.net/collectionuser');
        console.log('Connected to MongoDB');

        // Tìm tất cả sách có trường quantity
        const books = await Book.find({ quantity: { $exists: true } });
        console.log(`Found ${books.length} books with quantity field`);

        // Xóa trường quantity khỏi tất cả sách
        const result = await Book.updateMany(
            { quantity: { $exists: true } },
            { $unset: { quantity: "" } }
        );

        console.log(`Removed quantity field from ${result.modifiedCount} books`);
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
removeBookQuantity(); 