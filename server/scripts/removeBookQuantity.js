const mongoose = require('mongoose');
const Book = require('../models/books.model');

async function removeBookQuantity() {
    try {
        // Kết nối database
        await mongoose.connect('mongodb+srv://coder:9gBohtaHyxhd7iUP@cluster0.frvqwl9.mongodb.net/collectionuser');

        // Tìm tất cả sách có trường quantity
        const books = await Book.find({ quantity: { $exists: true } });

        // Xóa trường quantity khỏi tất cả sách
        const result = await Book.updateMany(
            { quantity: { $exists: true } },
            { $unset: { quantity: "" } }
        );

    } catch (error) {
        console.error('Error updating books:', error);
    } finally {
        // Đóng kết nối database
        await mongoose.connection.close();
    }
}

// Chạy script
removeBookQuantity(); 