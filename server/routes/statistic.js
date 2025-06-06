const express = require('express')
const router = express.Router()

const statisticsController = require('../controllers/statistics.controller')


router.get('/revenue/all', statisticsController.getTotalRevenue)
router.get('/revenue/week', statisticsController.getRevenueWeek)
router.get('/revenue/lifetime', statisticsController.getRevenueLifeTime)
router.get('/ordercount/lifetime', statisticsController.getOrderCountLifeTime)
router.get('/product/bestseller', statisticsController.getBestSeller)


module.exports = router;
