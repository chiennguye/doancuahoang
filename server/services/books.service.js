const Book = require('../models/books.model')
const Order = require('../models/orders.model')
const mongoose = require("mongoose");
const redis = require('../config/redis');

const bookService = {
    getAll: async({query, page, limit, sort}) => {
        const skip = (page - 1) * limit
        const [count, books] = await Promise.all([
            Book.countDocuments(query), 
            Book.find(query).populate('genre author publisher').skip(skip).limit(limit).sort(sort)
        ]);
        return [count, books];
    },
    getByBookId: async(bookId) => {
        return await Book.findOne({bookId: bookId}).populate('author publisher genre')
    },
    getById: async(id) => {
        return await Book.findById(id).populate('author publisher genre')
       
    },
    getBySlug: async(slug) => {
        return await Book.findOne({slug}).populate('author publisher genre')
    },
    checkIsOrdered: async(id) => {
        const ObjectId = mongoose.Types.ObjectId;
        return await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product", 
                }
            },
            { $match : { _id : ObjectId(id) } }
        ])
    },
    search: async({key, page, limit}) => {
        const query = [
            {
                $lookup: {
                    from: "authors",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { 
                $match: {
                    $or: [
                        { name: { $regex: key, $options:"i" } }, 
                        { "author.name": { $regex: key, $options:"i" } } 
                    ]
                }
            },
        ]
        if (limit && +limit > 0) {
            const skip = (page - 1) * limit
            query.push({ $skip : skip }, { $limit: limit })
        }
        return await Book.aggregate(query)
    },
    create: async(body) => {
        try {
            const { quantity, ...bookData } = body;
            const newBook = new Book({
                ...bookData,
                quantity: quantity || 0
            });
            const savedBook = await newBook.save();
            return savedBook;
        } catch (error) {
            throw error;
        }
    },
    updateById: async(id, body) => {
        try {
            const existingBook = await Book.findById(id);
            if (!existingBook) {
                return null;
            }
        
            const { name, year, genre, author, publisher, description,
                pages, size, price, discount, quantity, imageUrl, publicId } = body;

            const updateData = {
                name, year, genre, author, publisher, description,
                pages, size, price, discount, quantity
            };

            if (imageUrl) {
                updateData.imageUrl = imageUrl;
            }
            if (publicId) {
                updateData.publicId = publicId;
            }

            const result = await Book.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true }
            ).populate('genre author publisher');

            return result;
        } catch (error) {
            throw error;
        }
    },
    deleteById: async(id) => {
        return await Book.findByIdAndDelete(id)
    },
    updateQuantity: async(id, newQuantity) => {
        try {
            const updatedBook = await Book.findOneAndUpdate(
                { _id: id },
                { $set: { quantity: newQuantity } },
                { new: true }
            ).populate('genre author publisher');

            if (!updatedBook) {
                return null;
            }

            return {
                book: updatedBook,
                message: 'Cập nhật số lượng thành công'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = bookService
