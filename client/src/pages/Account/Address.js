import { useCallback, useEffect, useState } from "react";
import { Button, Modal, Card, Row, Col, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaStar,
  FaHome,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import AddressSelect from "../../components/AddressSelect";
import userApi from "../../api/userApi";
import styles from "./Address.module.css";

function Address() {
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [addressDelete, setAddressDelete] = useState({});

  const [showModal, setShowModal] = useState(false);

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAdress = async () => {
      try {
        setLoading(true);
        setApiError("");
        const { data } = await userApi.getAllAddressById(userId);
        setAddressList(data?.address || []);
      } catch (error) {
        console.log(error);
        setApiError("Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAdress();
    }
  }, [userId]);

  const handleSubmitAddNewAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddress ||
      !newAddress.province ||
      !newAddress.district ||
      !newAddress.ward
    ) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      const {
        province: { provinceId, provinceName },
        district: { districtId, districtName },
        ward: { wardId, wardName },
        address,
      } = newAddress;

      if (!address || address.trim() === "") {
        setApiError("Vui lòng nhập số nhà, tên đường");
        setLoading(false);
        return;
      }

      const { data } = await userApi.addAddress(userId, {
        address: {
          address: `${address}, ${wardName}, ${districtName}, ${provinceName}`,
          provinceId,
          districtId,
          wardId,
        },
      });

      setShowAddForm(false);
      setAddressList((preState) => {
        const newArray = [...preState];
        newArray.push({
          _id: data?._id,
          address: data?.address,
          isDefault: false,
        });
        return newArray;
      });
    } catch (error) {
      console.log(error);
      setApiError("Không thể thêm địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallApiDelete = async () => {
    try {
      setLoading(true);
      setApiError("");
      await userApi.deleteById(userId, addressDelete?._id);
      setShowModal(false);
      setAddressList((preState) => {
        const newArray = [...preState];
        return newArray.filter((item) => item._id !== addressDelete?._id);
      });
    } catch (error) {
      setShowModal(false);
      console.log(error);
      setApiError("Không thể xóa địa chỉ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      setApiError("");
      await userApi.updateDefaultAddressById(userId, addressId);
      setAddressList((preState) => {
        const newArray = [...preState];
        return newArray.map((item) => {
          return item._id === addressId
            ? { ...item, isDefault: true }
            : { ...item, isDefault: false };
        });
      });
    } catch (error) {
      console.log(error);
      setApiError("Không thể cập nhật địa chỉ mặc định. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAddress = useCallback((data) => {
    setNewAddress(data);
  }, []);

  return (
    <div className={styles.addressContainer}>
      {/* Delete Confirmation Modal */}
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        className={styles.deleteModal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>
            <FaTrash className={styles.modalIcon} />
            Xác nhận xóa địa chỉ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <div className={styles.deleteConfirmation}>
            <div className={styles.deleteIcon}>
              <FaTrash />
            </div>
            <h5>Bạn có chắc chắn muốn xóa địa chỉ này?</h5>
            <p className={styles.addressToDelete}>
              {addressDelete && addressDelete?.address}
            </p>
            <small className={styles.deleteWarning}>
              Hành động này không thể hoàn tác!
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className={styles.cancelBtn}
          >
            <FaTimes className={styles.btnIcon} />
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleCallApiDelete}
            disabled={loading}
            className={styles.deleteBtn}
          >
            <FaTrash className={styles.btnIcon} />
            {loading ? "Đang xóa..." : "Xóa địa chỉ"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FaMapMarkerAlt />
          </div>
          <div className={styles.headerText}>
            <h3>Quản lý địa chỉ giao hàng</h3>
            <p>Thêm và quản lý các địa chỉ giao hàng của bạn</p>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{addressList.length}</span>
            <span className={styles.statLabel}>Địa chỉ</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert variant="danger" className={styles.errorAlert}>
          <strong>Lỗi!</strong> {apiError}
        </Alert>
      )}

      {/* Address List */}
      <div className={styles.addressSection}>
        {loading && !showAddForm ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải danh sách địa chỉ...</p>
          </div>
        ) : addressList && addressList.length > 0 ? (
          <Row className="g-3">
            {addressList.map((item, index) => (
              <Col xl={6} key={item._id}>
                <Card
                  className={`${styles.addressCard} ${
                    item.isDefault ? styles.defaultCard : ""
                  }`}
                >
                  <Card.Body>
                    <div className={styles.addressHeader}>
                      <div className={styles.addressNumber}>#{index + 1}</div>
                      {item.isDefault && (
                        <div className={styles.defaultBadge}>
                          <FaStar className={styles.defaultIcon} />
                          <span>Mặc định</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.addressContent}>
                      <div className={styles.addressIcon}>
                        <FaHome />
                      </div>
                      <div className={styles.addressText}>
                        <p>{item.address}</p>
                      </div>
                    </div>

                    <div className={styles.addressActions}>
                      {!item.isDefault && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleUpdateDefaultAddress(item?._id)}
                          disabled={loading}
                          className={styles.defaultBtn}
                        >
                          <FaStar className={styles.btnIcon} />
                          {loading ? "Đang xử lý..." : "Đặt mặc định"}
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setAddressDelete(item);
                          setShowModal(true);
                        }}
                        disabled={loading}
                        className={styles.deleteActionBtn}
                      >
                        <FaTrash className={styles.btnIcon} />
                        Xóa
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className={styles.emptyAddresses}>
            <Card className={styles.emptyCard}>
              <Card.Body>
                <div className={styles.emptyContent}>
                  <div className={styles.emptyIcon}>📍</div>
                  <h4>Chưa có địa chỉ giao hàng</h4>
                  <p>Thêm địa chỉ giao hàng để dễ dàng đặt hàng hơn</p>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      {/* Add Address Button */}
      <div className={styles.addButtonSection}>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setApiError("");
          }}
          disabled={loading}
          className={styles.addAddressBtn}
          size="lg"
        >
          {showAddForm ? (
            <>
              <FaTimes className={styles.btnIcon} />
              Hủy thêm địa chỉ
            </>
          ) : (
            <>
              <FaPlus className={styles.btnIcon} />
              Thêm địa chỉ mới
            </>
          )}
        </Button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <Card className={styles.addFormCard}>
          <Card.Header className={styles.formHeader}>
            <h5 className={styles.formTitle}>
              <FaPlus className={styles.formIcon} />
              Thêm địa chỉ giao hàng mới
            </h5>
          </Card.Header>
          <Card.Body>
            <form
              onSubmit={handleSubmitAddNewAddress}
              className={styles.addForm}
            >
              <div className={styles.formGroup}>
                <AddressSelect onChange={handleChangeAddress} />
              </div>
              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className={styles.cancelFormBtn}
                >
                  <FaTimes className={styles.btnIcon} />
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  <FaSave className={styles.btnIcon} />
                  {loading ? "Đang thêm..." : "Thêm địa chỉ"}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default Address;
