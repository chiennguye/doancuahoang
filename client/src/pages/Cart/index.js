import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  NavLink,
  Card,
  Form,
  Badge,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  AiOutlineShoppingCart,
  AiOutlineTag,
  AiOutlineGift,
  AiOutlineCreditCard,
  AiOutlineArrowRight,
  AiOutlineShop,
} from "react-icons/ai";

import CartItem from "../../components/Shop/CartItem";
import Loading from "../../components/Loading";

import format from "../../helper/format";
import styles from "./Cart.module.css";

import userApi from "../../api/userApi";
import voucherApi from "../../api/voucherApi";
import { updateVoucher } from "../../redux/actions/cart";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);
  const { voucher } = cartData;
  const [voucherInput, setVoucherInput] = useState(voucher?.code || "");
  const [voucherLoading, setVoucherLoading] = useState(false);

  useEffect(() => {
    setVoucherInput(voucher?.code || "");
  }, [voucher]);

  useEffect(() => {
    const addToCart = async () => {
      try {
        const { list } = cartData;
        const newList = list.map((item) => {
          return { product: item?.product._id, quantity: item?.quantity };
        });
        await userApi.updateCart(currentUser.userId, { cart: newList });
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser && currentUser.userId) {
      addToCart();
    } else {
      navigate({ pathname: "/" });
    }
  }, [cartData, currentUser, navigate]);

  const handleNavigateToCheckout = (e) => {
    if (!currentUser.userId) {
      e.preventDefault();
      alert("Bạn cần đăng nhập để thực hiện thanh toán!");
      return;
    }

    // Kiểm tra số lượng sản phẩm trong kho
    const invalidItems = cartData.list.filter(item => item.quantity > item.product.quantity);
    if (invalidItems.length > 0) {
      e.preventDefault();
      const productNames = invalidItems.map(item => item.product.name).join(", ");
      toast.error(`Số lượng sản phẩm ${productNames} trong giỏ hàng vượt quá số lượng có sẵn trong kho!`, {
        autoClose: 3000
      });
      return;
    }
  };

  const handleApplyVoucher = async () => {
    try {
      setVoucherLoading(true);
      if (!voucherInput) {
        dispatch(
          updateVoucher({
            _id: "",
            code: "",
            value: 0,
            by: "",
            minimum: 0,
          })
        );
        setVoucherLoading(false);
        return;
      }
      if (voucherInput === cartData?.voucher?.code) {
        setVoucherLoading(false);
        return;
      }
      const { data: voucherData } = await voucherApi.getByCode(voucherInput);
      const { minimum, _id, value, by, start, end } = voucherData;

      if (!_id) {
        toast.info("Voucher này không tồn tại!", { autoClose: 2000 });
        dispatch(
          updateVoucher({
            _id: "",
            code: "",
            value: 0,
            by: "",
          })
        );
        setVoucherLoading(false);
        return;
      }
      if (cartData.subTotal < minimum) {
        toast.info(
          `Giá trị đơn hàng cần tối thiểu ${format.formatPrice(
            minimum
          )} để áp dụng!`,
          { autoClose: 2000 }
        );
        setVoucherLoading(false);
        return;
      }
      const now = new Date();
      if (!(now >= new Date(start) && now <= new Date(end))) {
        toast.info("Thời gian không phù hợp!");
        setVoucherLoading(false);
        return;
      }

      dispatch(
        updateVoucher({
          _id: _id,
          code: voucherInput,
          value: value,
          by: by,
          minimum: minimum,
        })
      );
      toast.success("Áp dụng mã giảm giá thành công!", { autoClose: 2000 });
      setVoucherLoading(false);
    } catch (error) {
      setVoucherLoading(false);
      console.log(error);
    }
  };

  const getCartStats = () => {
    const totalItems = cartData.list.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalProducts = cartData.list.length;
    return { totalItems, totalProducts };
  };

  const stats = getCartStats();

  return (
    <div className={styles.cartPage}>
      <Container>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbSection}>
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>
              <span className={styles.breadcrumbIcon}>🏠</span>
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <span className={styles.breadcrumbIcon}>🛒</span>
              Giỏ hàng
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <AiOutlineShoppingCart className={styles.titleIcon} />
                Giỏ Hàng Của Bạn
              </h1>
              <p className={styles.pageSubtitle}>
                Xem lại và chỉnh sửa đơn hàng trước khi thanh toán
              </p>
            </div>
            {cartData.list.length > 0 && (
              <div className={styles.headerRight}>
                <div className={styles.statsContainer}>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {stats.totalProducts}
                    </div>
                    <div className={styles.statLabel}>Sản phẩm</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>{stats.totalItems}</div>
                    <div className={styles.statLabel}>Số lượng</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statNumber}>
                      {format.formatPrice(cartData.total)}
                    </div>
                    <div className={styles.statLabel}>Tổng tiền</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {cartData.list.length > 0 ? (
          <Row className="g-4">
            <Col xl={8}>
              <div className={styles.cartItemsSection}>
                <Card className={styles.cartItemsCard}>
                  <Card.Header className={styles.cartItemsHeader}>
                    <h4 className={styles.sectionTitle}>
                      <AiOutlineShoppingCart className={styles.sectionIcon} />
                      Sản phẩm trong giỏ hàng
                    </h4>
                  </Card.Header>
                  <Card.Body className={styles.cartItemsBody}>
                    <div className={styles.cartItemsList}>
                      {cartData.list.map((item, index) => (
                        <div
                          key={item.product._id}
                          className={styles.cartItemWrapper}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CartItem
                            productId={item.product._id}
                            name={item.product.name}
                            imageUrl={item.product.imageUrl}
                            price={item.product.price}
                            quantity={item.quantity}
                            totalPriceItem={item.totalPriceItem}
                            product={item.product}
                          />
                          
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
            <Col xl={4}>
              <div className={styles.orderSummarySection}>
                {/* Voucher Section */}
                <Card className={styles.voucherCard}>
                  <Card.Header className={styles.voucherHeader}>
                    <h5 className={styles.voucherTitle}>
                      <AiOutlineGift className={styles.voucherIcon} />
                      Mã giảm giá
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className={styles.voucherInputGroup}>
                      <Form.Control
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className={styles.voucherInput}
                        disabled={voucherLoading}
                      />
                      <Button
                        onClick={handleApplyVoucher}
                        className={styles.voucherBtn}
                        disabled={voucherLoading}
                      >
                        {voucherLoading ? <Loading /> : "Áp dụng"}
                      </Button>
                    </div>
                    {voucher?.code && (
                      <div className={styles.appliedVoucher}>
                        <AiOutlineTag className={styles.appliedVoucherIcon} />
                        <span>Đã áp dụng: </span>
                        <Badge bg="success" className={styles.voucherCodeBadge}>
                          {voucher.code}
                        </Badge>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Order Summary */}
                <Card className={styles.orderSummaryCard}>
                  <Card.Header className={styles.orderSummaryHeader}>
                    <h5 className={styles.orderSummaryTitle}>
                      <AiOutlineCreditCard
                        className={styles.orderSummaryIcon}
                      />
                      Tóm tắt đơn hàng
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className={styles.orderSummaryDetails}>
                      <div className={styles.summaryRow}>
                        <span>Tạm tính</span>
                        <span>{format.formatPrice(cartData.subTotal)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Phí vận chuyển</span>
                        <span className={styles.freeShipping}>Miễn phí</span>
                      </div>
                      {cartData.discount > 0 && (
                        <div className={styles.summaryRow}>
                          <span>Giảm giá</span>
                          <span className={styles.discount}>
                            -{format.formatPrice(cartData.discount)}
                          </span>
                        </div>
                      )}
                      <div className={styles.summaryDivider}></div>
                      <div
                        className={`${styles.summaryRow} ${styles.totalRow}`}
                      >
                        <span>Tổng cộng</span>
                        <span className={styles.totalAmount}>
                          {format.formatPrice(cartData.total)}
                        </span>
                      </div>
                    </div>
                    <Link to="/thanh-toan" onClick={handleNavigateToCheckout}>
                      <Button className={styles.checkoutBtn}>
                        <AiOutlineCreditCard className={styles.checkoutIcon} />
                        Tiến hành thanh toán
                        <AiOutlineArrowRight className={styles.checkoutArrow} />
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>

                {/* Continue Shopping */}
                <Card className={styles.continueShoppingCard}>
                  <Card.Body>
                    <div className={styles.continueShoppingContent}>
                      <AiOutlineShop className={styles.continueShoppingIcon} />
                      <p className={styles.continueShoppingText}>
                        Bạn muốn mua thêm sản phẩm khác?
                      </p>
                      <Link
                        to="/san-pham"
                        className={styles.continueShoppingBtn}
                      >
                        Tiếp tục mua sắm
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        ) : (
          <div className={styles.emptyCart}>
            <Card className={styles.emptyCartCard}>
              <Card.Body>
                <div className={styles.emptyCartContent}>
                  <div className={styles.emptyCartIcon}>🛒</div>
                  <h3 className={styles.emptyCartTitle}>Giỏ hàng trống</h3>
                  <p className={styles.emptyCartText}>
                    Không có sản phẩm nào trong giỏ hàng của bạn!
                    <br />
                    Hãy khám phá các sản phẩm tuyệt vời của chúng tôi.
                  </p>
                  <Link to="/san-pham" className={styles.startShoppingBtn}>
                    <AiOutlineShop className={styles.startShoppingIcon} />
                    Bắt đầu mua sắm
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Cart;
