import { useEffect, useState } from "react";
import {
  Breadcrumb,
  Container,
  NavLink,
  Row,
  Col,
  Card,
  Form,
  Badge,
  Button,
} from "react-bootstrap";
import {
  AiOutlineSearch,
  AiOutlineGift,
  AiOutlinePercentage,
  AiOutlineCalendar,
} from "react-icons/ai";
import Loading from "../../components/Loading";
import DiscountItem from "../../components/Shop/DiscountItem";
import voucherApi from "../../api/voucherApi";
import styles from "./Discount.module.css";

export default function Discount() {
  const [voucherData, setVoucherData] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await voucherApi.getAll({
          valid: true,
          limit: 20,
          sortByDate: "desc",
        });
        setLoading(false);
        setVoucherData(res.data);
        setFilteredVouchers(res.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = voucherData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((voucher) => voucher.by === filterType);
    }

    setFilteredVouchers(filtered);
  }, [voucherData, searchTerm, filterType]);

  const getVoucherStats = () => {
    const total = voucherData.length;
    const percent = voucherData.filter((v) => v.by === "percent").length;
    const fixed = voucherData.filter((v) => v.by === "fixed").length;
    return { total, percent, fixed };
  };

  const stats = getVoucherStats();

  return (
    <div className={styles.discountPage}>
      <Container>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbSection}>
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>
              <span className={styles.breadcrumbIcon}>🏠</span>
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <span className={styles.breadcrumbIcon}>🎫</span>
              Khuyến mãi
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <AiOutlineGift className={styles.titleIcon} />
                Mã Giảm Giá
              </h1>
              <p className={styles.pageSubtitle}>
                Tận hưởng những ưu đãi tuyệt vời cho đơn hàng của bạn
              </p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{stats.total}</div>
                  <div className={styles.statLabel}>Tổng mã</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{stats.percent}</div>
                  <div className={styles.statLabel}>Giảm %</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{stats.fixed}</div>
                  <div className={styles.statLabel}>Giảm VNĐ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.filterSection}>
          <Card className={styles.filterCard}>
            <Card.Body>
              <Row className="align-items-center">
                <Col lg={6} md={12} className="mb-3 mb-lg-0">
                  <div className={styles.searchContainer}>
                    <AiOutlineSearch className={styles.searchIcon} />
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm mã giảm giá..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                </Col>
                <Col lg={4} md={8} className="mb-3 mb-lg-0">
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm theo VNĐ</option>
                  </Form.Select>
                </Col>
                <Col lg={2} md={4}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                    className={styles.clearBtn}
                  >
                    Xóa bộ lọc
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Vouchers Content */}
        <div className={styles.contentSection}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loading />
              <p className={styles.loadingText}>Đang tải mã giảm giá...</p>
            </div>
          ) : filteredVouchers && filteredVouchers.length > 0 ? (
            <>
              <div className={styles.resultsHeader}>
                <h3>
                  Hiển thị {filteredVouchers.length} mã giảm giá
                  {searchTerm && (
                    <Badge bg="primary" className={styles.searchBadge}>
                      "{searchTerm}"
                    </Badge>
                  )}
                  {filterType !== "all" && (
                    <Badge bg="secondary" className={styles.filterBadge}>
                      {filterType === "percent" ? "Giảm %" : "Giảm VNĐ"}
                    </Badge>
                  )}
                </h3>
              </div>

              <div className={styles.vouchersGrid}>
                {filteredVouchers.map((item, index) => (
                  <div
                    key={item._id}
                    className={styles.voucherWrapper}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <DiscountItem item={item} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.noVouchers}>
              <div className={styles.noVouchersIcon}>
                {searchTerm || filterType !== "all" ? "🔍" : "🎫"}
              </div>
              <h3>
                {searchTerm || filterType !== "all"
                  ? "Không tìm thấy mã giảm giá nào"
                  : "Hiện tại không có mã giảm giá nào"}
              </h3>
              <p>
                {searchTerm || filterType !== "all"
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Vui lòng quay lại sau để xem các ưu đãi mới"}
              </p>
              {(searchTerm || filterType !== "all") && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className={styles.resetBtn}
                >
                  Xem tất cả mã giảm giá
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {!loading && filteredVouchers.length > 0 && (
          <div className={styles.tipsSection}>
            <Card className={styles.tipsCard}>
              <Card.Body>
                <h4 className={styles.tipsTitle}>
                  <AiOutlineCalendar className={styles.tipsIcon} />
                  Mẹo sử dụng mã giảm giá
                </h4>
                <Row>
                  <Col md={4}>
                    <div className={styles.tip}>
                      <AiOutlinePercentage className={styles.tipIcon} />
                      <p>Kiểm tra điều kiện tối thiểu của đơn hàng</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className={styles.tip}>
                      <AiOutlineCalendar className={styles.tipIcon} />
                      <p>Chú ý thời hạn sử dụng của mã</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className={styles.tip}>
                      <AiOutlineGift className={styles.tipIcon} />
                      <p>Mỗi mã chỉ sử dụng được một lần</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
