import { Badge, Row, Col, Card } from "react-bootstrap";
import {
  FaStore,
  FaUser,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaCalendarAlt,
  FaIdCard,
  FaGift,
  FaShoppingCart,
  FaImage,
  FaBarcode,
} from "react-icons/fa";
import OrderProgress from "../OrderProgress";
import moment from "moment";
import format from "../../helper/format";
import { useSelector } from "react-redux";
import styles from "./OrderDetail.module.css";

export default function OrderDetail({ data }) {
  const { role } = useSelector((state) => state.auth);

  return (
    <div className={styles.orderDetailContainer}>
      {/* Store & Order Header */}
      <Card className={styles.headerCard}>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className={styles.storeInfo}>
                <div className={styles.storeIcon}>
                  <FaStore />
                </div>
                <div>
                  <h4 className={styles.storeName}>BOOKSTORE</h4>
                  <p className={styles.storeAddress}>
                    Số 1, ngõ 45, phố Hoàng Quốc Việt, phường Nghĩa Tân, quận Cầu Giấy, Hà Nội
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.orderInfo}>
                <div className={styles.infoItem}>
                  <FaBarcode className={styles.infoIcon} />
                  <span>
                    Hóa đơn: <strong>#{data?._id}</strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaCalendarAlt className={styles.infoIcon} />
                  <span>
                    Ngày mua:{" "}
                    <strong>
                      {moment(data?.createdAt).format("DD/MM/YYYY HH:mm")}
                    </strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaIdCard className={styles.infoIcon} />
                  <span>
                    Tài khoản: <strong>{data?.user?._id}</strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaUser className={styles.infoIcon} />
                  <span>
                    Khách hàng: <strong>{data?.user?.fullName}</strong>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Delivery Information */}
      <Card className={styles.infoCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>
            <FaMapMarkerAlt className={styles.titleIcon} />
            Thông tin giao hàng
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className={styles.deliveryInfo}>
                <div className={styles.infoItem}>
                  <FaUser className={styles.infoIcon} />
                  <span>
                    Người nhận: <strong>{data?.delivery?.fullName}</strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaMapMarkerAlt className={styles.infoIcon} />
                  <span>
                    Địa chỉ: <strong>{data?.delivery?.address}</strong>
                  </span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.deliveryInfo}>
                <div className={styles.infoItem}>
                  <FaEnvelope className={styles.infoIcon} />
                  <span>
                    Email: <strong>{data?.delivery?.email}</strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaPhone className={styles.infoIcon} />
                  <span>
                    SĐT: <strong>{data?.delivery?.phoneNumber}</strong>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payment & Status Information */}
      <Card className={styles.infoCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>
            <FaCreditCard className={styles.titleIcon} />
            Thanh toán & Trạng thái
          </h5>
        </Card.Header>
        <Card.Body>
          <div className={styles.paymentInfo}>
            <div className={styles.paymentMethod}>
              <span className={styles.methodLabel}>
                Phương thức thanh toán:
              </span>
              <span className={styles.methodValue}>{data?.method?.text}</span>
              {data?.method?.code !== 0 && (
                <Badge
                  className={styles.paymentBadge}
                  bg={data?.paymentStatus?.code === 2 ? "success" : "danger"}
                >
                  {data?.paymentStatus?.text}
                </Badge>
              )}
            </div>
            <div className={styles.orderStatus}>
              <span className={styles.statusLabel}>Trạng thái đơn hàng:</span>
              <span className={styles.statusValue}>
                {data?.orderStatus?.text}
              </span>
            </div>
          </div>
          {data?.orderStatus?.text !== "Đơn hàng đã hủy" && (
            <div className={styles.progressSection}>
              <OrderProgress current={data?.orderStatus?.code} />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Tracking Information */}
      {data?.tracking && data?.tracking?.length > 0 && (
        <Card className={styles.infoCard}>
          <Card.Header className={styles.cardHeader}>
            <h5 className={styles.cardTitle}>
              <FaShoppingCart className={styles.titleIcon} />
              Lịch sử tracking
            </h5>
          </Card.Header>
          <Card.Body>
            <div className={styles.trackingList}>
              {data?.tracking.map((item) => (
                <div key={item?._id} className={styles.trackingItem}>
                  <div className={styles.trackingTime}>
                    <FaCalendarAlt className={styles.trackingIcon} />
                    <strong>
                      {moment(item?.time).format("DD/MM/YYYY HH:mm")}
                    </strong>
                  </div>
                  <div className={styles.trackingDetails}>
                    <p className={styles.trackingStatus}>{item?.status}</p>
                    {role >= 2 && (
                      <p className={styles.trackingUser}>
                        Thực hiện: <strong>{item?.user?.fullName}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Voucher Information */}
      {data?.voucher && data?.voucher?.code && (
        <Card className={styles.infoCard}>
          <Card.Header className={styles.cardHeader}>
            <h5 className={styles.cardTitle}>
              <FaGift className={styles.titleIcon} />
              Thông tin voucher
            </h5>
          </Card.Header>
          <Card.Body>
            <div className={styles.voucherInfo}>
              <div className={styles.voucherItem}>
                <span>Mã voucher:</span>
                <Badge bg="primary" className={styles.voucherCode}>
                  {data?.voucher?.code}
                </Badge>
              </div>
              <div className={styles.voucherItem}>
                <span>Hình thức giảm:</span>
                <strong>
                  {data?.voucher?.by === "amount" ? "Mức cố định" : "Phần trăm"}
                </strong>
              </div>
              <div className={styles.voucherItem}>
                <span>Giá trị giảm:</span>
                <strong className={styles.discountValue}>
                  {data?.voucher.by === "amount"
                    ? format.formatPrice(data?.voucher?.value)
                    : `${data?.voucher?.value}%`}
                </strong>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Products List */}
      <Card className={styles.productsCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>
            <FaShoppingCart className={styles.titleIcon} />
            Danh sách sản phẩm
          </h5>
        </Card.Header>
        <Card.Body className={styles.productsBody}>
          {data && data?.products && data?.products?.length > 0 ? (
            <div className={styles.productsList}>
              {data?.products.map((item, index) => (
                <div key={item._id} className={styles.productItem}>
                  <div className={styles.productIndex}>#{index + 1}</div>
                  <div className={styles.productImage}>
                    <img
                      src={item?.product?.imageUrl}
                      alt={item?.product?.name}
                      className={styles.productImg}
                    />
                  </div>
                  <div className={styles.productDetails}>
                    <h6 className={styles.productName}>
                      {item?.product?.name}
                    </h6>
                    <p className={styles.productId}>
                      <FaBarcode className={styles.productIcon} />
                      Mã: {item?.product?._id}
                    </p>
                  </div>
                  <div className={styles.productQuantity}>
                    <span className={styles.quantityLabel}>Số lượng</span>
                    <span className={styles.quantityValue}>
                      {item?.quantity}
                    </span>
                  </div>
                  <div className={styles.productPrice}>
                    <span className={styles.priceLabel}>Đơn giá</span>
                    <span className={styles.priceValue}>
                      {format.formatPrice(item?.price)}
                    </span>
                  </div>
                  <div className={styles.productTotal}>
                    <span className={styles.totalLabel}>Thành tiền</span>
                    <span className={styles.totalValue}>
                      {format.formatPrice(item?.totalItem)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyProducts}>
              <FaShoppingCart className={styles.emptyIcon} />
              <p>Không có sản phẩm nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Order Summary */}
      <Card className={styles.summaryCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>
            <FaCreditCard className={styles.titleIcon} />
            Tóm tắt đơn hàng
          </h5>
        </Card.Header>
        <Card.Body>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Tạm tính:</span>
              <span>{format.formatPrice(data?.cost?.subTotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span className={styles.shippingFee}>
                +{format.formatPrice(data?.cost?.shippingFee)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Giảm giá:</span>
              <span className={styles.discount}>
                -{format.formatPrice(data?.cost?.discount)}
              </span>
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng cộng:</span>
              <span className={styles.totalAmount}>
                {format.formatPrice(data?.cost.total)}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
