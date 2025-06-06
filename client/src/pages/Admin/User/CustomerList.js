import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Col, Modal, Row, Spinner, Table, Form } from "react-bootstrap";
import { FaEye, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import moment from "moment";
import format from "../../../helper/format";

import PaginationBookStore from "../../../components/PaginationBookStore";
import OrderDetail from "../../../components/OrderDetail";
import steps from "../../../components/OrderProgress/enum";
import userApi from "../../../api/userApi"
import orderApi from "../../../api/orderApi"

export default function CustomerList() {
  const [customerData, setCustomerData] = useState({})
  const [orderList, setOrderList] = useState([])
  const [orderDetail, setOrderDetail] = useState({})

  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [searchString, setSearchString] = useState("")

  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    status: 1
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = {
          "$or": [
            { fullName: { "$regex": searchString, "$options": "i" } },
            { email: { "$regex": searchString, "$options": "i" } },
            { phoneNumber: { "$regex": searchString, "$options": "i" } },
          ],
          role: 0
        }
        const { data, pagination } = await userApi.getAll({ 
          page, 
          limit: 10,
          query
        });
        setLoading(false);
        setCustomerData({ list: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, searchString]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const getOrderHistory = async (userId) => {
    try {
      const { data } = await orderApi.getAll({
        userId,
        limit: 10,
      })
      setOrderList(data)
      setShowModal(true)
    } catch (error) {
      console.log(error)
    }
  }

  const handleGetOrderDetail = async (orderId) => {
    try {
      const { data } = await orderApi.getById(orderId, {});
      setOrderDetail(data);
      setShowOrderDetailModal(true);
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      status: user.status
    });
    setShowEditModal(true);
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      
      // If only status is changed, use updateStatus API
      if (selectedUser.status !== editForm.status) {
        await userApi.updateStatus(selectedUser._id, { status: editForm.status });
      }
      
      // Update other user information (excluding email)
      await userApi.updateById(selectedUser._id, {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber
      });
      
      setShowEditModal(false);
      // Refresh the list
      const query = {
        "$or": [
          { fullName: { "$regex": searchString, "$options": "i" } },
          { email: { "$regex": searchString, "$options": "i" } },
          { phoneNumber: { "$regex": searchString, "$options": "i" } },
        ],
        role: 0
      }
      const { data, pagination } = await userApi.getAll({ 
        page, 
        limit: 10,
        query
      });
      setCustomerData({ list: data, totalPage: pagination.totalPage });
      setLoadingAction(false);
      toast.success("Cập nhật thông tin khách hàng thành công!");
    } catch (error) {
      console.log(error);
      setLoadingAction(false);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin khách hàng!");
    }
  }

  const handleDeleteSubmit = async () => {
    try {
      setLoadingAction(true);
      await userApi.deleteById(selectedUser._id);
      setShowDeleteModal(false);
      // Refresh the list
      const query = {
        "$or": [
          { fullName: { "$regex": searchString, "$options": "i" } },
          { email: { "$regex": searchString, "$options": "i" } },
          { phoneNumber: { "$regex": searchString, "$options": "i" } },
        ],
        role: 0
      }
      const { data, pagination } = await userApi.getAll({ 
        page, 
        limit: 10,
        query
      });
      setCustomerData({ list: data, totalPage: pagination.totalPage });
      setLoadingAction(false);
      toast.success("Xóa khách hàng thành công!");
    } catch (error) {
      console.log(error);
      setLoadingAction(false);
      toast.error("Có lỗi xảy ra khi xóa khách hàng!");
    }
  }

  return (
    <Row>
      {/* Order Detail Modal */}
      <Modal size="lg" dialogClassName="modal-w1100" show={showOrderDetailModal} onHide={() => setShowOrderDetailModal(false)}>
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

      {/* Order History Modal */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Lịch sử giao dịch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{maxHeight: "500px", overflowY: "scroll"}}>
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
                  ) :
                    orderList.map((item, index) => {
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
                          <td><span className="badge" style={{backgroundColor: steps?.[item?.orderStatus?.code]?.color}}>{item?.orderStatus?.text}</span></td>
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
                  }
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                disabled
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: parseInt(e.target.value)})}
              >
                <option value={1}>Đã xác minh</option>
                <option value={0}>Chưa xác minh</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={loadingAction}>
                {loadingAction ? <Spinner animation="border" size="sm" /> : "Lưu"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa khách hàng {selectedUser?.fullName}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit} disabled={loadingAction}>
            {loadingAction ? <Spinner animation="border" size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách khách hàng</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input className="form-control search" placeholder="Tìm kiếm bằng tên, email, SĐT" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Button type="button" style={{color: "white"}} variant="info"
                onClick={() => {
                  setSearchString(searchInput)
                  setPage(1)
                }}
                >
                  <FaSearch />
              </Button>
            </div>
          </div>
          
          <Table hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khách hàng</th>
                <th>Tài khoản</th>
                <th>Trạng thái</th>
                <th colSpan="3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              ) : customerData?.list && customerData?.list?.length > 0 ? (
                customerData.list.map((item, index) => {
                  return (
                    <tr key={item._id}>
                      <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                      <td className="text-start">
                        <div className="d-flex align-items-center">
                          <img className="avatar" src={item?.avatar?.url} alt="" />
                          <div >
                            <p>Họ tên: <b>{item?.fullName}</b></p>
                            <p>Email: <b>{item?.email}</b></p>
                            <p>Điện thoại: <b>{item?.phoneNumber}</b></p>
                          </div>
                        </div>
                      </td>
                      <td><p>{item?.serviceId ? item?.service : "Tài khoản BookStore"}</p></td>
                      <td><Badge bg={item?.status === 1 ? "success" : "danger"}>{item?.status === 1 ? "Đã xác minh" : "Chưa xác minh"}</Badge></td>
                      <td>
                        <Button variant="warning" onClick={() => getOrderHistory(item?._id)} >
                          Lịch sử mua hàng
                        </Button>
                      </td>
                      <td>
                        <Button variant="primary" onClick={() => handleEditClick(item)}>
                          <FaEdit />
                        </Button>
                      </td>
                      <td>
                        <Button variant="danger" onClick={() => handleDeleteClick(item)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>Không có khách hàng nào!</td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="admin-content-pagination">
            <Row>
              <Col xl={12}>
                {customerData.totalPage > 1 ? (
                  <PaginationBookStore
                    totalPage={customerData.totalPage}
                    currentPage={page}
                    onChangePage={handleChangePage}
                  />
                ) : null}
              </Col>
            </Row>
          </div>
        </div>
      </Col>
    </Row>
  );
}

