const express = require('express')
const router = express.Router()

const orderController = require('../controllers/orders.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')

router.get('/', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.getAll)
router.get('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.getById)

router.post('/', verifyToken, orderController.create)
router.post('/thanhtoan/momo', verifyToken, orderController.getPayUrlMoMo)
router.post('/thanhtoan/momo/verify', verifyToken, orderController.verifyMoMo)

router.put('/:id/paymentid', verifyToken, orderController.updatePaymentId)
router.put('/:id/order-status', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.updateOrderStatus)
router.put('/:id/cancel', verifyToken, orderController.cancelOrder)

module.exports = router;
