import React, { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";

import {
  FaHome,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaDollarSign,
  FaPercentage,
  FaBookOpen,
  FaSearch,
  FaThList,
  FaTh,
  FaLayerGroup,
} from "react-icons/fa";

import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";
import styles from "./GenreDetail.module.css";

export default function GenreDetail() {
  const params = useParams();
  const { genre } = params;

  const [bookData, setBookData] = useState({});
  const [genreData, setGenreData] = useState({});
  const [sortString, setSortString] = useState("createdAt|-1");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [isLoading, setIsLoading] = useState(false);

  const sortOptions = [
    { value: "createdAt|-1", label: "Mới nhất", icon: FaCalendarAlt },
    { value: "createdAt|1", label: "Cũ nhất", icon: FaCalendarAlt },
    { value: "price|1", label: "Giá tăng dần", icon: FaSortAmountUp },
    { value: "price|-1", label: "Giá giảm dần", icon: FaSortAmountDown },
    { value: "discount|-1", label: "Giảm giá nhiều nhất", icon: FaPercentage },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const sortArr = sortString.split("|");
        const { data, pagination } = await bookApi.getAll({
          query: {
            genre: { $in: genreData?._id },
          },
          limit: 8,
          page: page,
          sort: {
            [sortArr[0]]: parseInt(sortArr[1]),
          },
        });
        setBookData({ books: data, totalPage: pagination.totalPage });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (genreData?._id) {
      fetchData();
    }
  }, [genreData, sortString, page]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await genreApi.getBySlug(genre);
        setGenreData(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (genre) {
      fetchData();
    }
  }, [genre]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const getCurrentSortOption = () => {
    return (
      sortOptions.find((option) => option.value === sortString) ||
      sortOptions[0]
    );
  };

  return (
    <div className={styles.genreDetailPage}>
      <Container>
        {/* Breadcrumb Section */}
        <div className={styles.breadcrumbSection}>
          <nav className={styles.breadcrumb}>
            <div className={styles.breadcrumbItem}>
              <FaHome className={styles.breadcrumbIcon} />
              <span>Trang chủ</span>
            </div>
            <FaChevronRight className={styles.breadcrumbSeparator} />
            <div className={styles.breadcrumbItem}>
              <FaBookOpen className={styles.breadcrumbIcon} />
              <span>Sản Phẩm</span>
            </div>
            <FaChevronRight className={styles.breadcrumbSeparator} />
            <div
              className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}
            >
              <FaLayerGroup className={styles.breadcrumbIcon} />
              <span>{genreData?.name || "Đang tải..."}</span>
            </div>
          </nav>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.genreInfo}>
              <h1 className={styles.genreTitle}>
                <FaLayerGroup className={styles.genreTitleIcon} />
                {genreData?.name || "Đang tải..."}
              </h1>
              {genreData?.description && (
                <p className={styles.genreDescription}>
                  {genreData.description}
                </p>
              )}
              <div className={styles.statsInfo}>
                <div className={styles.statItem}>
                  <FaBookOpen className={styles.statIcon} />
                  <span>{bookData.books?.length || 0} sản phẩm</span>
                </div>
                {bookData.totalPage > 1 && (
                  <div className={styles.statItem}>
                    <FaSearch className={styles.statIcon} />
                    <span>
                      Trang {page}/{bookData.totalPage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className={styles.controlsSection}>
          <div className={styles.controlsWrapper}>
            <div className={styles.leftControls}>
              <div className={styles.sortControl}>
                <FaFilter className={styles.controlIcon} />
                <label className={styles.controlLabel}>Sắp xếp:</label>
                <div className={styles.sortSelect}>
                  <select
                    value={sortString}
                    onChange={(e) => setSortString(e.target.value)}
                    className={styles.sortDropdown}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className={styles.currentSort}>
                    {React.createElement(getCurrentSortOption().icon, {
                      className: styles.sortIcon,
                    })}
                    <span>{getCurrentSortOption().label}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rightControls}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${
                    viewMode === "grid" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Xem dạng lưới"
                >
                  <FaTh />
                </button>
                <button
                  className={`${styles.viewBtn} ${
                    viewMode === "list" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  title="Xem dạng danh sách"
                >
                  <FaThList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className={styles.productsSection}>
          {isLoading ? (
            <div className={styles.loadingSection}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Đang tải sản phẩm...</p>
            </div>
          ) : bookData.books && bookData.books.length > 0 ? (
            <Row className={`g-4 ${styles.productsGrid}`}>
              {bookData.books.map((book) => (
                <Col
                  key={book._id}
                  xl={viewMode === "grid" ? 3 : 12}
                  lg={viewMode === "grid" ? 4 : 12}
                  md={viewMode === "grid" ? 6 : 12}
                  sm={12}
                >
                  <BookItem data={book} viewMode={viewMode} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FaBookOpen />
              </div>
              <h3 className={styles.emptyTitle}>Không có sản phẩm nào</h3>
              <p className={styles.emptyMessage}>
                Hiện tại chưa có sách nào trong thể loại "{genreData?.name}".
                Vui lòng quay lại sau hoặc khám phá các thể loại khác.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {bookData.totalPage > 1 && (
          <div className={styles.paginationSection}>
            <PaginationBookStore
              totalPage={bookData.totalPage}
              currentPage={page}
              onChangePage={handleChangePage}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
