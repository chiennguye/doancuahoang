import { useCallback, useEffect, useState } from "react";
import { Row, Col, Table, Spinner, Modal, Badge, Button } from "react-bootstrap";
import moment from 'moment'
import { FaEdit, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useBook } from "../../../contexts/BookContext";
import { toast } from 'react-toastify';

import PaginationBookStore from "../../../components/PaginationBookStore";
import OrderProgress from "../../../components/OrderProgress";
import OrderDetail from "../../../components/OrderDetail";

import steps from "../../../components/OrderProgress/enum";
import orderApi from "../../../api/orderApi";
import format from "../../../helper/format";

export default function OrderList() {
  const navigate = useNavigate();
  const { triggerRefresh } = useBook();
  const [orderData, setOrderData] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);

  const [orderDetail, setOrderDetail] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await orderApi.getAll({
          page: page,
          limit: 10,
        });
        setLoading(false);
        setOrderData({ orders: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleGetOrderDetail = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        setOrderDetail(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        setOrderDetail(data);
      }
      setShowModalUpdate(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setLoadingUpdate(true);
      const { data } = await orderApi.updateOrderStatus(orderDetail?._id, { 
        orderStatusCode: +orderDetail?.orderStatus?.code + 1
      });
      
      const { orderStatus, paymentStatus } = data;
      
      // Cập nhật lại thông tin đơn hàng
      setOrderDetail((pre) => ({
        ...pre,
        orderStatus,
        paymentStatus
      }));

      // Cập nhật lại danh sách đơn hàng
      setOrderData((pre) => ({
        ...pre,
        orders: pre.orders.map((item) => 
          item?._id === orderDetail?._id
            ? { ...item, orderStatus, paymentStatus }
            : item
        )
      }));

      // Nếu đơn hàng đã hoàn thành (status = 6), kích hoạt refresh để cập nhật danh sách sách
      if (orderStatus.code === steps.length - 1) {
        // Đợi một chút để đảm bảo server đã cập nhật xong
        setTimeout(() => {
          triggerRefresh();
        }, 500);
      }
      
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setLoadingUpdate(false);
      setShowModalUpdate(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setLoadingUpdate(true);
      const { data } = await orderApi.updateOrderStatus(orderDetail?._id, { 
        orderStatusCode: 6 // Status code for cancelled
      });
      
      const { orderStatus, paymentStatus } = data;
      
      // Cập nhật lại thông tin đơn hàng
      setOrderDetail((pre) => ({
        ...pre,
        orderStatus,
        paymentStatus
      }));

      // Cập nhật lại danh sách đơn hàng
      setOrderData((pre) => ({
        ...pre,
        orders: pre.orders.map((item) => 
          item?._id === orderDetail?._id
            ? { ...item, orderStatus, paymentStatus }
            : item
        )
      }));
      
      toast.success("Hủy đơn hàng thành công!");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng!");
    } finally {
      setLoadingUpdate(false);
      setShowModalUpdate(false);
    }
  };

  return (
    <Row>
      <Modal
        dialogClassName="modal-w1100"
        size="lg"
        show={showModalUpdate}
        onHide={() => setShowModalUpdate(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModalUpdate && orderDetail && orderDetail?.orderStatus?.text && (
            <div>
              <p className="mb-4">Trạng thái đơn hàng: <b>{orderDetail?.orderStatus?.text}</b></p>
              <OrderProgress current={orderDetail?.orderStatus?.code} />
              {orderDetail?.orderStatus?.code !== 6 && (
                <div className="d-flex justify-content-center gap-3 mt-4">
                  {orderDetail?.orderStatus?.code === 0 && (
                    <Button variant="danger" disabled={loadingUpdate} onClick={handleCancelOrder}>
                      Hủy đơn hàng
                    </Button>
                  )}
                  {orderDetail?.orderStatus?.code < steps.length - 1 && (
                    <Button variant="success" disabled={loadingUpdate} onClick={handleUpdateStatus}>
                      Chuyển sang trạng thái tiếp theo
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        dialogClassName="modal-w1100"
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Hóa đơn <Badge bg="secondary">{orderDetail?._id}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal && orderDetail && (
              <OrderDetail data={orderDetail} />
          )}
        </Modal.Body>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách đơn hàng</div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thông tin giao hàng</th>
                  <th>Ngày đặt hàng</th>
                  <th>Tổng tiền</th>
                  <th>Tình trạng</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item?._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="text-start">
                          <p>Người nhận: <b>{item?.delivery?.fullName}</b></p>
                          <p>Email: <b>{item?.delivery?.email}</b></p>
                          <p>Điện thoại: <b>{item?.delivery?.phoneNumber}</b></p>
                          <p>Địa chỉ: <b>{item?.delivery?.address}</b> </p>
                        </td>
                        <td>
                          <p>{moment(item?.createdAt).format('DD-MM-yyyy HH:mm:ss')}</p>
                          {moment(item.createdAt).isSame(moment(), 'day') && (
                             <span style={{backgroundColor: "#ff709e"}} className="badge">{moment(item?.createdAt).fromNow()}</span>
                          )}
                        </td>
                        <td className="price fw-bold">
                          {format.formatPrice(item?.cost?.total)}
                        </td>
                        <td><span className="badge" style={{backgroundColor: (item?.orderStatus?.text === "Đã hủy" || item?.orderStatus?.code === 6) ? "#dc3545" : steps[item?.orderStatus?.code]?.color}}>{item?.orderStatus?.text}</span></td>
                        <td>
                          <button
                            className="btn btn-success"
                            onClick={() => handleUpdateOrder(item?._id)}
                            disabled={
                              (item?.method?.code !== 0 &&
                              item?.paymentStatus?.code !== 2) ||
                              item?.orderStatus?.code === 6 // Block nếu đã hủy
                            }
                          >
                            <FaEdit />
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleGetOrderDetail(item?._id)}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có đơn hàng nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {orderData.totalPage > 1 ? (
                    <PaginationBookStore
                      totalPage={orderData.totalPage}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  ) : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
