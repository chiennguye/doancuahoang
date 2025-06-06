const Redis = require("ioredis")

const redisClient = new Redis({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 2000,
    retryStrategy: function(times) {
        // Nếu kết nối thất bại, thử lại sau 1 giây
        return Math.min(times * 1000, 3000);
    }
});

// Xử lý sự kiện lỗi kết nối
redisClient.on('error', function(err) {
    console.log('Redis error:', err.message);
});

// Xử lý sự kiện kết nối thành công
redisClient.on('connect', function() {
    console.log('Redis connected successfully');
});

module.exports = redisClient
