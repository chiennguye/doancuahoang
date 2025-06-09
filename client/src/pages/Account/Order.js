import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Spinner,
  Modal,
  Badge,
  Button,
  Card,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";

import {
  FaEye,
  FaCreditCard,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShoppingBag,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { AiOutlineShoppingCart, AiOutlineFileText } from "react-icons/ai";

import PaginationBookStore from "../../components/PaginationBookStore";
import OrderDetail from "../../components/OrderDetail";
import Loading from "../../components/Loading";
import format from "../../helper/format";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import methodData from "../Checkout/methodData";
import steps from "../../components/OrderProgress/enum";
import orderApi from "../../api/orderApi";
import styles from "./Order.module.css";

export default function Order() {
  const { userId } = useSelector((state) => state.auth);

  const [orderData, setOrderData] = useState([]);
  const [orderDetail, setOrderDetail] = useState({});
  const [page, setPage] = useState(1);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  const [loading, setLoading] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await orderApi.getAll({
          userId: userId,
          page: page,
          limit: 5,
        });
        setLoading(false);
        setOrderData({ orders: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    const fetchOrderStats = async () => {
      try {
        const { data } = await orderApi.getOrderStats(userId);
        setOrderStats(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (userId) {
      fetchOrder();
      fetchOrderStats();
    }
  }, [userId, page]);

  const handleGetOrderDetail = async (orderId) => {
    try {
      if (!(orderDetail?._id === orderId)) {
        const { data } = await orderApi.getById(orderId, { userId: userId });
        setOrderDetail(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    if (selectedMethod === 1) {
      try {
        const {
          cost: { total },
          _id,
        } = selectedOrder;
        const paymentId = uuidv4();
        setLoadingCheckout(true);
        await orderApi.updatePaymentId(_id, { paymentId });
        const { payUrl } = await orderApi.getPayUrlMoMo({
          amount: total,
          paymentId,
        });
        setLoadingCheckout(false);
        window.location.href = payUrl;
      } catch (error) {
        setLoadingCheckout(false);
        console.log(error);
      }
    } else {
      alert("Tính năng đang phát triển!");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoadingCancel(true);
      await orderApi.cancelOrder(orderId);
      
      // Cập nhật lại danh sách đơn hàng
      setOrderData((pre) => ({
        ...pre,
        orders: pre.orders.map((item) => 
          item?._id === orderId
            ? { 
                ...item, 
                orderStatus: { code: 6, text: "Đơn hàng đã hủy" }
              }
            : item
        )
      }));
      
      toast.success("Hủy đơn hàng thành công!");
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng!");
    } finally {
      setLoadingCancel(false);
    }
  };

  const getOrderStats = () => {
    return [
      {
        title: "Tất cả",
        count: orderStats.total,
        icon: <AiOutlineShoppingCart />,
        color: "#4e73df",
      },
      {
        title: "Chờ xác nhận",
        count: orderStats.pending,
        icon: <FaClock />,
        color: "#f6c23e",
      },
      {
        title: "Giao thành công",
        count: orderStats.completed,
        icon: <FaCheckCircle />,
        color: "#1cc88a",
      },
      {
        title: "Đã hủy",
        count: orderStats.cancelled,
        icon: <FaTimesCircle />,
        color: "#e74a3b",
      },
    ];
  };

  const stats = getOrderStats();

  return (
    <div className={styles.orderContainer}>
      {/* Order Statistics */}
      {orderData?.orders && orderData.orders.length > 0 && (
        <div className={styles.orderStats}>
          <Row className="g-3">
            {stats.map((stat, index) => (
              <Col key={index} lg={3} md={6} sm={12}>
                <Card className={styles.statCard}>
                  <Card.Body>
                    <div className={styles.statContent}>
                      <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                        {stat.icon}
                      </div>
                      <div className={styles.statInfo}>
                        <h6 className={styles.statTitle}>{stat.title}</h6>
                        <h3 className={styles.statCount}>{stat.count}</h3>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Orders List */}
      <div className={styles.ordersSection}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loading />
            <p className={styles.loadingText}>Đang tải đơn hàng...</p>
          </div>
        ) : orderData?.orders && orderData?.orders?.length > 0 ? (
          <div className={styles.ordersList}>
            {orderData.orders.map((item, index) => (
              <Card
                className={`${styles.orderCard} ${
                  item?.orderStatus?.code === 6 ? styles.cancelledOrder : ""
                }`}
                key={item._id}
              >
                <Card.Body>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderNumber}>
                      <AiOutlineFileText className={styles.orderIcon} />
                      <span>Đơn hàng #{(page - 1) * 5 + (index + 1)}</span>
                    </div>
                    <div className={styles.orderDate}>
                      <FaCalendarAlt className={styles.dateIcon} />
                      <span>
                        {moment(item?.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                  </div>

                  <Row className="g-4">
                    {/* Delivery Information */}
                    <Col lg={4}>
                      <div className={styles.orderSection}>
                        <h6 className={styles.sectionTitle}>
                          <FaMapMarkerAlt className={styles.sectionIcon} />
                          Thông tin giao hàng
                        </h6>
                        <div className={styles.deliveryInfo}>
                          <p className={styles.infoItem}>
                            <FaUser className={styles.infoIcon} />
                            <span>
                              Người nhận:{" "}
                              <strong>{item?.delivery?.fullName}</strong>
                            </span>
                          </p>
                          <p className={styles.infoItem}>
                            <FaEnvelope className={styles.infoIcon} />
                            <span>
                              Email: <strong>{item?.delivery?.email}</strong>
                            </span>
                          </p>
                          <p className={styles.infoItem}>
                            <FaPhone className={styles.infoIcon} />
                            <span>
                              SĐT:{" "}
                              <strong>{item?.delivery?.phoneNumber}</strong>
                            </span>
                          </p>
                          <p className={styles.infoItem}>
                            <FaMapMarkerAlt className={styles.infoIcon} />
                            <span>
                              Địa chỉ:{" "}
                              <strong>{item?.delivery?.address}</strong>
                            </span>
                          </p>
                        </div>
                      </div>
                    </Col>

                    {/* Order Status & Payment */}
                    <Col lg={4}>
                      <div className={styles.orderSection}>
                        <h6 className={styles.sectionTitle}>
                          <FaShoppingBag className={styles.sectionIcon} />
                          Trạng thái & Thanh toán
                        </h6>
                        <div className={styles.statusInfo}>
                          <div className={styles.statusBadge}>
                            <Badge
                              className={styles.orderStatus}
                              style={{
                                backgroundColor:
                                  steps[item?.orderStatus?.code]?.color,
                              }}
                            >
                              {item?.orderStatus?.text}
                            </Badge>
                          </div>
                          <div className={styles.paymentMethod}>
                            <p className={styles.methodText}>
                              <FaCreditCard className={styles.methodIcon} />
                              {item?.method?.text}
                            </p>
                            {item?.method?.code !== 0 && (
                              <Badge
                                bg={
                                  item?.paymentStatus?.code === 2
                                    ? "success"
                                    : "danger"
                                }
                                className={styles.paymentBadge}
                              >
                                {item?.paymentStatus?.code === 2 ? (
                                  <FaCheckCircle className={styles.badgeIcon} />
                                ) : (
                                  <FaTimesCircle className={styles.badgeIcon} />
                                )}
                                {item?.paymentStatus?.text}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Total & Actions */}
                    <Col lg={4}>
                      <div className={styles.orderSection}>
                        <h6 className={styles.sectionTitle}>
                          <FaMoneyBillWave className={styles.sectionIcon} />
                          Tổng tiền & Hành động
                        </h6>
                        <div className={styles.totalSection}>
                          <div className={styles.totalAmount}>
                            {format.formatPrice(item?.cost?.total)}
                          </div>
                          <div className={styles.actionButtons}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleGetOrderDetail(item?._id)}
                              className={styles.viewBtn}
                            >
                              <FaEye className={styles.btnIcon} />
                              Xem chi tiết
                            </Button>
                            {item?.method?.code !== 0 &&
                              item?.paymentStatus?.code !== 2 && (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(item);
                                    setShowCheckoutModal(true);
                                  }}
                                  className={styles.payBtn}
                                >
                                  <FaCreditCard className={styles.btnIcon} />
                                  Thanh toán
                                </Button>
                              )}
                            {item?.orderStatus?.code < 2 && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancelOrder(item?._id)}
                                disabled={loadingCancel}
                                className={styles.cancelBtn}
                              >
                                {loadingCancel ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                  </>
                                ) : (
                                  <>
                                    <FaTimesCircle className={styles.btnIcon} />
                                    Hủy đơn
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className={styles.emptyOrders}>
            <Card className={styles.emptyCard}>
              <Card.Body>
                <div className={styles.emptyContent}>
                  <div className={styles.emptyIcon}>🛍️</div>
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
                  <Button href="/san-pham" className={styles.shopBtn}>
                    <AiOutlineShoppingCart className={styles.shopIcon} />
                    Bắt đầu mua sắm
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Pagination */}
        {orderData?.totalPage > 1 && (
          <div className={styles.paginationSection}>
            <PaginationBookStore
              totalPage={orderData.totalPage}
              currentPage={page}
              onChangePage={handleChangePage}
            />
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <Modal
        size="lg"
        show={showCheckoutModal}
        onHide={() => setShowCheckoutModal(false)}
        className={styles.checkoutModal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>
            <FaCreditCard className={styles.modalIcon} />
            Thanh toán đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <div className={styles.checkoutContent}>
            <div className={styles.orderSummary}>
              <h6 className={styles.summaryTitle}>Thông tin đơn hàng</h6>
              <div className={styles.summaryItem}>
                <span>Tổng tiền:</span>
                <strong>
                  {format.formatPrice(selectedOrder?.cost?.total)}
                </strong>
              </div>
            </div>

            <div className={styles.paymentMethods}>
              <h6 className={styles.methodsTitle}>
                Chọn phương thức thanh toán
              </h6>
              <div className={styles.methodsList}>
                {methodData &&
                  methodData.map((method) => {
                    if (method?.value !== 0) {
                      return (
                        <div key={method.value} className={styles.methodItem}>
                          <input
                            type="radio"
                            name="method"
                            value={method.value}
                            id={method.name}
                            checked={+selectedMethod === method.value}
                            onChange={(e) => setSelectedMethod(+e.target.value)}
                            className={styles.methodRadio}
                          />
                          <label
                            htmlFor={method.name}
                            className={styles.methodLabel}
                          >
                            <span className={styles.methodText}>
                              {method.name}
                            </span>
                            {method.image && (
                              <img
                                className={styles.methodImage}
                                src={method.image}
                                alt={method.name}
                              />
                            )}
                          </label>
                        </div>
                      );
                    } else return null;
                  })}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setShowCheckoutModal(false)}
            className={styles.cancelBtn}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className={styles.checkoutBtn}
          >
            {loadingCheckout ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FaCreditCard className={styles.btnIcon} />
                Thanh toán
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName={styles.detailModal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>
            <AiOutlineFileText className={styles.modalIcon} />
            Chi tiết đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {showModal && orderDetail && <OrderDetail data={orderDetail} />}
        </Modal.Body>
      </Modal>
    </div>
  );
}
