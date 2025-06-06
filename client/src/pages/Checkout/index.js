import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Form,
  Modal,
  Card,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import {
  FaCheck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCreditCard,
  FaTruck,
  FaCalendarAlt,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTag,
  FaCalculator,
} from "react-icons/fa";

import PayItem from "../../components/Shop/PayItem";
import AddressSelect from "../../components/AddressSelect";
import PayPal from "../../components/PayPal";

import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import format from "../../helper/format";

import axios from "axios";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";

import methodData from "./methodData";

import { destroy } from "../../redux/actions/cart";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const [addressList, setAddressList] = useState([]);

  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);

  const [defaultAddress, setDefaultAddress] = useState("");
  const [newAddress, setNewAddress] = useState({});
  const [shippingAddress, setShippingAddress] = useState({});

  const [serviceList, setServiceList] = useState([]);
  const [serviceId, setServiceId] = useState("");

  const [showModalPayPal, setShowModalPayPal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(false);

  const [shippingFee, setShippingFee] = useState(0);
  const [leadTime, setLeadTime] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSuccess = () => {
    toast.success("Đặt mua hàng thành công!", { autoClose: 2000 });
    dispatch(destroy());
    navigate({ pathname: "/don-hang" });
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!currentUser.userId || !token) {
      navigate({ pathname: "/" });
    }
  }, [navigate, currentUser, cartData]);

  useEffect(() => {
    // Call API lấy danh sách địa chỉ
    const fetchDataAddress = async () => {
      try {
        const { data } = await userApi.getAllAddressById(currentUser.userId);
        const addressData = data.address;
        if (addressData.length > 0) {
          const result = addressData.filter((item) => item?.isDefault === true);
          if (result.length > 0) {
            setDefaultAddress({
              ...result[0],
              fullAddress: result[0]?.address,
            });
            setNewAddress({ ...result[0], fullAddress: result[0]?.address });
          } else {
            setDefaultAddress({
              ...addressData[0],
              fullAddress: addressData[0]?.address,
            });
            setNewAddress({
              ...addressData[0],
              fullAddress: addressData[0]?.address,
            });
          }
        }
        setAddressList([
          ...addressData,
          { address: "Địa chỉ khác", _id: "-1" },
        ]);
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.userId) {
      fetchDataAddress();
    }
  }, [currentUser]);

  const formik = useFormik({
    initialValues: {
      fullName: currentUser && currentUser.fullName ? currentUser.fullName : "",
      email: currentUser && currentUser.email ? currentUser.email : "",
      phoneNumber:
        currentUser && currentUser.phoneNumber ? currentUser.phoneNumber : "",
      address: defaultAddress,
      method: 0,
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      fullName: Yup.string().required("Không được bỏ trống trường này!"),
      email: Yup.string()
        .email("Invalid email")
        .required("Không được bỏ trống trường này!"),
      phoneNumber: Yup.string().required("Không được bỏ trống trường này!"),
    }),
    onSubmit: async () => {
      const { email, fullName, phoneNumber, address, method } = formik.values;
      const { list } = cartData;
      const products = list.map((item) => {
        return {
          product: item?.product._id,
          imageUrl: item?.product?.imageUrl,
          name: item?.product?.name,
          quantity: item?.quantity,
          price: item?.product.price,
          totalItem: item?.totalPriceItem,
        };
      });

      if (address?._id === "-1" && shippingAddress?.address === "") {
        return alert("Vui lòng điền đầy đủ thông tin!");
      }
      if (shippingAddress?.fullAddress === "") {
        return;
      }
      const paymentId = uuidv4();
      const body = {
        userId: currentUser && currentUser.userId ? currentUser.userId : "",
        products,
        delivery: {
          fullName,
          email,
          phoneNumber,
          address: shippingAddress?.fullAddress,
        },
        voucherId: cartData?.voucher?._id,
        cost: {
          subTotal: cartData?.subTotal,
          shippingFee: shippingFee,
          discount: cartData?.discount,
          total: cartData?.total + shippingFee,
        },
        method: {
          code: +method,
          text: methodData.find((item) => item?.value === +method)?.name,
        },
        paymentId,
      };
      switch (+method) {
        case 0: {
          try {
            setLoading(true);
            await orderApi.create(body);
            await userApi.updateCart(currentUser?.userId, { cart: [] });
            toast.success("Đặt mua hàng thành công!", { autoClose: 2000 });
            setLoading(false);
            dispatch(destroy());
            navigate({ pathname: "/don-hang" });
          } catch (error) {
            setLoading(false);
          }
          break;
        }
        case 1: {
          try {
            setLoading(true);
            const { payUrl } = await orderApi.getPayUrlMoMo({
              amount: cartData?.total,
              paymentId,
            });
            await orderApi.create(body);
            await userApi.updateCart(currentUser?.userId, { cart: [] });
            setLoading(false);
            window.location.href = payUrl;
          } catch (error) {
            setLoading(false);
            console.log(error);
          }
          break;
        }
        case 2: {
          // setShowModalPayPal(true)
          alert("Tính năng đăng phát triển");
          break;
        }

        default: {
          break;
        }
      }
    },
  });

  const handleChangeAddress = useCallback((data) => {
    const {
      province: { provinceId, provinceName },
      district: { districtId, districtName },
      ward: { wardId, wardName },
      address,
    } = data;
    setNewAddress({
      address,
      fullAddress: `${address}, ${wardName}, ${districtName}, ${provinceName}`,
      provinceId,
      districtId,
      wardId,
      provinceName,
      districtName,
      wardName,
    });
  }, []);

  const handleChangeRadio = (e) => {
    const value = e.target.value;
    const address = addressList.find((item) => item?._id === value);
    if (address?._id === "-1") {
      formik.setFieldValue("address", address);
      setNewAddress({ fullAddress: "", address: "" });
    } else {
      formik.setFieldValue("address", address);
      setNewAddress({ ...address, fullAddress: address?.address });
    }
  };

  useEffect(() => {
    const getService = async () => {
      try {
        setLoadingService(true);
        const { data } = await axios.post(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
          {
            shop_id: 3710396,
            from_district: 1442,
            to_district: shippingAddress?.districtId,
          },
          {
            headers: {
              token: process.env.REACT_APP_GHN_TOKEN,
              shopid: 3710396,
            },
          }
        );

        if (data?.code === 200) {
          setServiceList(data?.data || []);
          if (data?.data?.length > 0) {
            setServiceId(data?.data[0]?.service_id);
          }
        }
        setLoadingService(false);
      } catch (error) {
        setLoadingService(false);
        console.log(error);
      }
    };
    if (shippingAddress && shippingAddress?.districtId) {
      getService();
    }
  }, [shippingAddress]);

  useEffect(() => {
    const getShippingFee = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
          {
            service_id: serviceId,
            insurance_value: cartData?.total || 100000,
            coupon: null,
            from_district_id: 1442,
            to_district_id: shippingAddress?.districtId,
            to_ward_code: shippingAddress?.wardId,
            height: 15,
            length: 15,
            weight: 1000,
            width: 15,
          },
          {
            headers: {
              token: process.env.REACT_APP_GHN_TOKEN,
              shopid: 3710396,
            },
          }
        );

        if (data?.code === 200) {
          setShippingFee(data?.data?.total);
          dispatch({
            type: "UPDATE_SHIPPING_FEE",
            payload: {
              shippingFee: data?.data?.total,
            },
          });
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    const getLeadTime = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
          {
            from_district_id: 1442,
            from_ward_code: "20314",
            to_district_id: shippingAddress?.districtId,
            to_ward_code: shippingAddress?.wardId,
            service_id: serviceId,
          },
          {
            headers: {
              token: process.env.REACT_APP_GHN_TOKEN,
              shopid: 3710396,
            },
          }
        );

        if (data?.code === 200) {
          setLeadTime(data?.data?.leadtime);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    if (
      shippingAddress &&
      shippingAddress?.districtId &&
      serviceId &&
      loadingService === false
    ) {
      getShippingFee();
      getLeadTime();
    }
  }, [serviceId, shippingAddress, cartData, loadingService, dispatch]);

  return (
    <div className={styles.checkoutContainer}>
      {/* PayPal Modal */}
      <Modal
        size="lg"
        show={showModalPayPal}
        onHide={() => setShowModalPayPal(false)}
        className={styles.paypalModal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>
            <FaCreditCard className={styles.modalIcon} />
            Thanh toán PayPal
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PayPal
            amount={(cartData?.total / 23805).toFixed(2)}
            onSuccess={handleSuccess}
          />
        </Modal.Body>
      </Modal>

      <Container>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <FaShoppingCart />
            </div>
            <div className={styles.headerText}>
              <h2>Thanh toán đơn hàng</h2>
              <p>Vui lòng kiểm tra thông tin và hoàn tất đặt hàng</p>
            </div>
          </div>
          <div className={styles.orderStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {cartData?.list?.length || 0}
              </span>
              <span className={styles.statLabel}>Sản phẩm</span>
            </div>
          </div>
        </div>

        <div className={styles.checkoutBody}>
          <Row className="g-4">
            {/* Left Column - Customer Information */}
            <Col lg={7}>
              {/* Customer Info Card */}
              <Card className={styles.infoCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className={styles.cardTitle}>
                    <FaUser className={styles.titleIcon} />
                    Thông tin nhận hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form className={styles.customerForm}>
                    <Row className="g-3">
                      <Col md={6}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <FaUser className={styles.labelIcon} />
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className={`${styles.formControl} ${
                              formik.errors.fullName
                                ? styles.isInvalid
                                : formik.values.fullName
                                ? styles.isValid
                                : ""
                            }`}
                            placeholder="Nhập họ và tên"
                            value={formik.values.fullName}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                          />
                          {formik.errors.fullName && (
                            <div className={styles.errorFeedback}>
                              {formik.errors.fullName}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <FaPhone className={styles.labelIcon} />
                            Số điện thoại *
                          </label>
                          <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            className={`${styles.formControl} ${
                              formik.errors.phoneNumber
                                ? styles.isInvalid
                                : formik.values.phoneNumber
                                ? styles.isValid
                                : ""
                            }`}
                            placeholder="Nhập số điện thoại"
                            value={formik.values.phoneNumber}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                          />
                          {formik.errors.phoneNumber && (
                            <div className={styles.errorFeedback}>
                              {formik.errors.phoneNumber}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            <FaEnvelope className={styles.labelIcon} />
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`${styles.formControl} ${
                              formik.errors.email
                                ? styles.isInvalid
                                : formik.values.email
                                ? styles.isValid
                                : ""
                            }`}
                            placeholder="Nhập địa chỉ email"
                            value={formik.values.email}
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                          />
                          {formik.errors.email && (
                            <div className={styles.errorFeedback}>
                              {formik.errors.email}
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {/* Shipping Address Card */}
              <Card className={styles.infoCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className={styles.cardTitle}>
                    <FaMapMarkerAlt className={styles.titleIcon} />
                    Địa chỉ giao hàng
                  </h5>
                </Card.Header>
                <Card.Body>
                  {/* Current Address Display */}
                  {shippingAddress?.fullAddress && (
                    <div className={styles.currentAddress}>
                      <div className={styles.addressInfo}>
                        <FaHome className={styles.addressIcon} />
                        <div className={styles.addressText}>
                          <p className={styles.addressLabel}>
                            Địa chỉ được chọn:
                          </p>
                          <p className={styles.addressValue}>
                            {shippingAddress.fullAddress}
                          </p>
                        </div>
                        <FaCheckCircle className={styles.confirmIcon} />
                      </div>
                    </div>
                  )}

                  {/* Address Selection */}
                  <div className={styles.addressSelection}>
                    {addressList && addressList?.length > 1 ? (
                      <div className={styles.addressList}>
                        {addressList.map((item) => (
                          <div key={item?._id} className={styles.addressOption}>
                            <input
                              type="radio"
                              name="address"
                              id={item?._id}
                              value={item?._id}
                              checked={
                                item?._id === formik?.values?.address?._id
                              }
                              onChange={handleChangeRadio}
                              className={styles.addressRadio}
                            />
                            <label
                              htmlFor={item?._id}
                              className={styles.addressLabel}
                            >
                              <FaMapMarkerAlt className={styles.optionIcon} />
                              {item?.address}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.newAddressForm}>
                        <AddressSelect onChange={handleChangeAddress} />
                      </div>
                    )}
                  </div>

                  {/* New Address Form */}
                  {formik.values?.address?._id === "-1" && (
                    <div className={styles.newAddressForm}>
                      <AddressSelect onChange={handleChangeAddress} />
                    </div>
                  )}

                  {/* Confirm Address Button */}
                  <div className={styles.confirmAddressSection}>
                    <Button
                      disabled={
                        loading ||
                        (formik.values?.address?._id === "-1" &&
                          newAddress?.address === "")
                      }
                      className={styles.confirmAddressBtn}
                      onClick={() => {
                        if (
                          (formik.values?.address?._id === "-1" ||
                            addressList?.length <= 1) &&
                          newAddress?.address === ""
                        ) {
                          return alert("Vui lòng điền đầy đủ thông tin!");
                        }
                        if (newAddress?.loading && newAddress?.loading === true)
                          return;
                        setShippingAddress(newAddress);
                      }}
                    >
                      <FaCheckCircle className={styles.btnIcon} />
                      Xác nhận địa chỉ giao hàng
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Shipping Service Card */}
              {/* {shippingAddress && shippingAddress?.districtId && (
                <Card className={styles.infoCard}>
                  <Card.Header className={styles.cardHeader}>
                    <h5 className={styles.cardTitle}>
                      <FaTruck className={styles.titleIcon} />
                      Dịch vụ vận chuyển
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {loadingService ? (
                      <div className={styles.loadingService}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Đang tải dịch vụ vận chuyển...</p>
                      </div>
                    ) : serviceList && serviceList?.length > 0 ? (
                      <div className={styles.serviceList}>
                        {serviceList.map((service) => (
                          <div
                            key={service?.service_id}
                            className={styles.serviceOption}
                          >
                            <input
                              type="radio"
                              name="service"
                              value={service?.service_id}
                              id={service?.service_id}
                              checked={serviceId === service?.service_id}
                              onChange={(e) => setServiceId(+e.target.value)}
                              className={styles.serviceRadio}
                            />
                            <label
                              htmlFor={service?.service_id}
                              className={styles.serviceLabel}
                            >
                              <FaTruck className={styles.serviceIcon} />
                              {service?.short_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert
                        variant="warning"
                        className={styles.noServiceAlert}
                      >
                        <FaTimesCircle className={styles.alertIcon} />
                        Không tìm thấy dịch vụ vận chuyển cho địa chỉ này
                      </Alert>
                    )}

                    {leadTime && (
                      <div className={styles.deliveryTime}>
                        <FaCalendarAlt className={styles.timeIcon} />
                        <span>Thời gian giao hàng dự kiến: </span>
                        <Badge bg="success" className={styles.timeBadge}>
                          {moment.unix(leadTime).format("DD/MM/YYYY")}
                        </Badge>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )} */}
            </Col>

            {/* Right Column - Order Summary & Payment */}
            <Col lg={5}>
              {/* Order Summary Card */}
              <Card className={styles.orderCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className={styles.cardTitle}>
                    <FaShoppingCart className={styles.titleIcon} />
                    Đơn hàng của bạn
                  </h5>
                </Card.Header>
                <Card.Body className={styles.orderBody}>
                  {/* Products List */}
                  <div className={styles.productsList}>
                    <div className={styles.productsHeader}>
                      <span className={styles.productLabel}>Sản phẩm</span>
                      <span className={styles.totalLabel}>Tổng</span>
                    </div>
                    <div className={styles.productsItems}>
                      {cartData?.list.map((item) => (
                        <PayItem
                          item={item?.product}
                          key={item?.product._id}
                          quantity={item?.quantity}
                          totalPriceItem={item?.totalPriceItem}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        <FaCalculator className={styles.summaryIcon} />
                        Tạm tính
                      </span>
                      <span className={styles.summaryValue}>
                        {format.formatPrice(cartData?.subTotal)}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        <FaTag className={styles.summaryIcon} />
                        Giảm giá
                      </span>
                      <span
                        className={`${styles.summaryValue} ${styles.discount}`}
                      >
                        -{format.formatPrice(cartData?.discount)}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        <FaTruck className={styles.summaryIcon} />
                        Phí vận chuyển
                      </span>
                      <span
                        className={`${styles.summaryValue} ${styles.shipping}`}
                      >
                        +{format.formatPrice(shippingFee)}
                      </span>
                    </div>
                    <div className={styles.summaryDivider}></div>
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span className={styles.summaryLabel}>Tổng cộng</span>
                      <span className={styles.totalAmount}>
                        {format.formatPrice(cartData?.total + shippingFee)}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Payment Method Card */}
              <Card className={styles.paymentCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className={styles.cardTitle}>
                    <FaCreditCard className={styles.titleIcon} />
                    Phương thức thanh toán
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className={styles.paymentMethods}>
                    {methodData &&
                      methodData.map((method) => (
                        <div
                          key={method.value}
                          className={styles.paymentOption}
                        >
                          <input
                            type="radio"
                            name="method"
                            value={method.value}
                            id={method.name}
                            checked={
                              parseInt(formik.values.method) === method.value
                            }
                            onChange={formik.handleChange}
                            className={styles.paymentRadio}
                          />
                          <label
                            htmlFor={method.name}
                            className={styles.paymentLabel}
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
                      ))}
                  </div>

                  {/* Place Order Button */}
                  <div className={styles.placeOrderSection}>
                    <Button
                      type="button"
                      className={styles.placeOrderBtn}
                      onClick={formik.handleSubmit}
                      disabled={
                        loading ||
                        formik.errors.email ||
                        formik.errors.fullName ||
                        !formik.values.phoneNumber ||
                        !shippingAddress?.fullAddress
                      }
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className={styles.loadingSpinner}></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className={styles.btnIcon} />
                          Đặt hàng ngay
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
