const crypto = require("crypto");
const axios = require("axios");

const orderService = require("../services/orders.service");
const voucherService = require("../services/vouchers.service");

const {
  paymentStatusEnum,
  methodEnum,
  orderStatusEnum,
} = require("../utils/enum");
const { orderSuccess } = require("../utils/sendMail");

const orderController = {
  getAll: async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 2;
      const sort = req.query.sort ? req.query.sort : { createdAt: -1 };
      const userId = req.query.userId;

      let query = {};
      if (userId) query.user = { $in: userId };

      const [count, data] = await orderService.getAll({
        query,
        page,
        limit,
        sort,
      });
      const totalPage = Math.ceil(count / limit);

      res.status(200).json({
        message: "success",
        error: 0,
        data,
        count,
        pagination: {
          page,
          limit,
          totalPage,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await orderService.getById(id);
      if (data) {
        res.status(200).json({
          message: "success",
          error: 0,
          data,
        });
      } else {
        res.status(404).json({
          message: "Không tìm thấy đơn hàng!",
          error: 1,
          data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  getPayUrlMoMo: async (req, res) => {
    try {
      const { amount, paymentId } = req.body;

      const host = req.get("origin");
      const link = `${host}/thanhtoan/momo/callback`;

      const partnerCode = "MOMO";
      const accessKey = "F8BBA842ECF85";
      const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const requestId = paymentId;
      const orderId = requestId;
      const orderInfo = "Thanh toán mua hàng tại BookStore";
      const redirectUrl = link;
      const ipnUrl = "https://callback.url/notify";
      const requestType = "captureWallet";
      const extraData = "";

      const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;

      const signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");
      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "en",
      });

      axios
        .post(
          "https://test-payment.momo.vn/v2/gateway/api/create",
          requestBody,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
        .then(({ data }) =>
          res.status(200).json({ message: "Ok", payUrl: data.payUrl })
        )
        .catch((err) => res.status(500).json({ message: err.message }));
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: 1,
        message: error.message,
      });
    }
  },
  verifyMoMo: async (req, res) => {
    try {
      const { paymentId } = req.body;

      const partnerCode = "MOMO";
      const accessKey = "F8BBA842ECF85";
      const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

      const rawSignature =
        "accessKey=" +
        accessKey +
        "&orderId=" +
        paymentId +
        "&partnerCode=" +
        partnerCode +
        "&requestId=" +
        paymentId;
      const signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = JSON.stringify({
        partnerCode: "MOMO",
        requestId: paymentId,
        orderId: paymentId,
        signature: signature,
        lang: "en",
      });

      axios
        .post(
          "https://test-payment.momo.vn/v2/gateway/api/query",
          requestBody,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
        .then(async ({ data }) => {
          const { resultCode } = data;
          if (resultCode === 0) {
            await orderService.updatePaymentStatusByPaymentId(paymentId, {
              paymentStatus: paymentStatusEnum?.Paid,
              method: methodEnum?.momo,
            });
            return res.status(200).json({ message: "Ok" });
          }
          await orderService.updatePaymentStatusByPaymentId(paymentId, {
            paymentStatus: paymentStatusEnum?.Failed,
            method: methodEnum?.momo,
          });
          res.status(200).json({ message: "Thanh toán lỗi!" });
        })
        .catch(async (err) => {
          // await orderService.updatePaymentStatusByPaymentId(paymentId, { paymentStatus: paymentStatusEnum?.Failed, method: methodEnum?.momo?.code })
          // res.status(500).json({ error: err.message })
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  create: async (req, res) => {
    try {
      const { userId, products, delivery, voucherId, cost, method, paymentId } =
        req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!userId) {
        return res.status(400).json({
          error: 1,
          message: "UserId không được để trống",
        });
      }

      if (!products || products.length <= 0) {
        return res
          .status(400)
          .json({ error: 1, message: "Giỏ hàng rỗng. Không thể thực hiện!!" });
      }

      if (!delivery) {
        return res.status(400).json({
          error: 1,
          message: "Thông tin giao hàng không được để trống",
        });
      }

      if (!cost) {
        return res.status(400).json({
          error: 1,
          message: "Thông tin giá không được để trống",
        });
      }

      if (!method) {
        return res.status(400).json({
          error: 1,
          message: "Phương thức thanh toán không được để trống",
        });
      }

      // Kiểm tra voucher nếu có
      try {
        if (voucherId) {
          const voucher = await voucherService.getById(voucherId);
          if (voucher) {
            const { minimum, start, end } = voucher;
            const now = new Date();
            if (cost?.subTotal < minimum) {
              return res.status(400).json({
                message: `Đơn hàng không thỏa giá trị đơn hàng cần tối thiểu`,
                error: 1,
              });
            }
            if (!(now >= new Date(start) && now <= new Date(end))) {
              return res.status(400).json({
                message: `Thời gian không phù hợp!`,
                error: 1,
              });
            }
          }
        }
      } catch (voucherError) {
        console.log("Lỗi khi kiểm tra voucher:", voucherError);
        return res.status(400).json({
          message: `Lỗi xử lý voucher: ${voucherError.message}`,
          error: 1,
        });
      }

      // Tạo đơn hàng
      let data;
      try {
        data = await orderService.create({
          userId,
          products,
          delivery,
          voucherId: voucherId || null,
          cost,
          method,
          paymentId: paymentId || null,
        });
      } catch (createError) {
        console.log("Lỗi khi tạo đơn hàng:", createError);
        return res.status(500).json({
          message: `Lỗi khi tạo đơn hàng: ${createError.message}`,
          error: 1,
        });
      }

      // Gửi email xác nhận
      if (data) {
        try {
          await orderSuccess({
            clientURL: req.get("origin"),
            delivery,
            products,
            method,
            cost,
          });
        } catch (emailError) {
          console.log("Lỗi khi gửi email xác nhận:", emailError);
          // Không return ở đây, vẫn trả về thông tin đơn hàng đã tạo
        }
      }

      return res.status(201).json({
        message: "success",
        error: 0,
        data,
      });
    } catch (error) {
      console.log("Lỗi chung khi tạo đơn hàng:", error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  updatePaymentId: async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentId } = req.body;
      const data = await orderService.updatePaymentId(id, { paymentId });
      res.status(200).json({
        message: "success",
        error: 0,
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { orderStatusCode } = req.body;
      const {
        user: { userId },
      } = req;
      const order = await orderService.getById(id);

      const {
        method,
        paymentStatus,
        orderStatus: { code: oldCode },
      } = order;

      if (
        method?.code !== methodEnum?.cash?.code &&
        paymentStatus?.code !== paymentStatusEnum?.Paid?.code
      ) {
        return res.status(400).json({
          error: 1,
          message: "Khách hàng chưa thanh toán! Không thể thực hiện!",
        });
      }

      const orderStatus = Object.entries(orderStatusEnum).find(
        ([a, b]) => +b.code === +orderStatusCode
      )?.[1];

      if (!orderStatus)
        return res
          .status(400)
          .json({ error: 1, message: "Trạng thái không hợp lệ!" });

      const { code } = orderStatus;

      if (code <= oldCode) {
        return res
          .status(400)
          .json({ error: 1, message: "Trạng thái không hợp lệ!" });
      }

      let newPaymentStatus = { ...paymentStatus };

      if (
        method?.code === methodEnum?.cash?.code &&
        code === orderStatusEnum?.delivered?.code
      ) {
        newPaymentStatus = paymentStatusEnum?.Paid;
      }

      const data = await orderService.updateStatus(id, {
        orderStatus,
        paymentStatus: newPaymentStatus,
      });
      if (data) {
        await orderService.addTracking(id, {
          status: orderStatus?.text,
          time: new Date(),
          userId,
        });
      }
      res.status(200).json({
        message: "success",
        error: 0,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  createOrder: async (req, res) => {
    try {
      // ...existing order creation code...

      // Replace email sending with console log
      console.log("Order confirmation would have been sent to:", email);

      res.status(201).json({
        message: "Đặt hàng thành công",
        error: 0,
        data: result,
      });
    } catch (error) {
      // ...error handling...
    }
  },
};

module.exports = orderController;
