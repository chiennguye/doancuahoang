import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  NavLink,
  Breadcrumb,
  Badge,
  Button,
} from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import Loading from "../../components/Loading/";

import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

import styles from "./Product.module.css";

export default function Product() {
  const [bookData, setBookData] = useState({});
  const [genreList, setGenreList] = useState([]);
  const [page, setPage] = useState(1);

  const [sortString, setSortString] = useState("createdAt|-1");
  const [genresChecked, setGenresChecked] = useState([]);

  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortArr = sortString.split("|");
        const query = {
          genre: { $in: genresChecked },
        };
        setLoading(true);
        const { data, pagination } = await bookApi.getAll({
          limit: 8,
          page: page,
          query,
          sort: {
            [sortArr[0]]: parseInt(sortArr[1]),
          },
        });
        setBookData({ books: data, totalPage: pagination.totalPage });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, [sortString, page, genresChecked]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await genreApi.getAll({});
        setGenreList(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGenres();
  }, []);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleChangeGenre = (e) => {
    const id = e.target.value;
    setPage(1);
    setGenresChecked((pre) => {
      if (pre.includes(id)) {
        return pre.filter((genre) => genre !== id);
      } else {
        return [...pre, id];
      }
    });
  };

  const clearAllFilters = () => {
    setGenresChecked([]);
    setPage(1);
  };

  const getSelectedGenreNames = () => {
    return genreList
      .filter((genre) => genresChecked.includes(genre._id))
      .map((genre) => genre.name);
  };

  const getSortDisplayName = (sortValue) => {
    const sortOptions = {
      "createdAt|-1": "Mới nhất",
      "createdAt|1": "Cũ nhất",
      "price|1": "Giá tăng dần",
      "price|-1": "Giá giảm dần",
      "discount|-1": "Giảm giá nhiều nhất",
    };
    return sortOptions[sortValue] || "Mới nhất";
  };

  return (
    <div className={styles.productPage}>
      <Container>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbSection}>
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>
              <span className={styles.breadcrumbIcon}>🏠</span>
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <span className={styles.breadcrumbIcon}>📚</span>
              Sản phẩm
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Cửa Hàng Sách</h1>
            <p className={styles.pageSubtitle}>
              Khám phá hàng ngàn cuốn sách hay từ các thể loại khác nhau
            </p>
          </div>
          <div className={styles.resultsInfo}>
            {!loading && bookData.books && (
              <span className={styles.resultsCount}>
                Hiển thị {bookData.books.length} sản phẩm
                {genresChecked.length > 0 && (
                  <span className={styles.filterInfo}>
                    {" "}
                    • Đã lọc: {getSelectedGenreNames().join(", ")}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className={styles.contentBody}>
          <Row>
            {/* Sidebar */}
            <Col xl={3} lg={4} className={styles.sidebarCol}>
              <div
                className={`${styles.sidebar} ${
                  sidebarCollapsed ? styles.collapsed : ""
                }`}
              >
                <div className={styles.sidebarHeader}>
                  <h3 className={styles.sidebarTitle}>Bộ lọc</h3>
                  <Button
                    className={styles.toggleSidebar}
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    {sidebarCollapsed ? "📂" : "📁"}
                  </Button>
                </div>

                {!sidebarCollapsed && (
                  <div className={styles.sidebarContent}>
                    {/* Active Filters */}
                    {genresChecked.length > 0 && (
                      <div className={styles.activeFilters}>
                        <div className={styles.activeFiltersHeader}>
                          <h4>Bộ lọc đang áp dụng</h4>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={clearAllFilters}
                            className={styles.clearAll}
                          >
                            Xóa tất cả
                          </Button>
                        </div>
                        <div className={styles.filterTags}>
                          {getSelectedGenreNames().map((name, index) => (
                            <Badge
                              key={index}
                              bg="primary"
                              className={styles.filterTag}
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Genre Filter */}
                    <div className={styles.filterGroup}>
                      <h4 className={styles.filterGroupTitle}>
                        <span className={styles.filterIcon}>📖</span>
                        Thể loại
                      </h4>
                      <div className={styles.filterList}>
                        {genreList &&
                          genreList.length > 0 &&
                          genreList.map((genre) => (
                            <div
                              className={styles.filterGroupItem}
                              key={genre._id}
                            >
                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  className={styles.checkbox}
                                  checked={genresChecked.includes(genre._id)}
                                  value={genre._id}
                                  onChange={handleChangeGenre}
                                />
                                <span className={styles.checkmark}></span>
                                <span className={styles.labelText}>
                                  {genre.name}
                                </span>
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>

            {/* Main Content */}
            <Col xl={9} lg={8}>
              <div className={styles.mainContent}>
                {/* Sort & Filter Bar */}
                <div className={styles.controlBar}>
                  <div className={styles.sortSection}>
                    <span className={styles.sortLabel}>Sắp xếp theo:</span>
                    <select
                      className={styles.sortSelect}
                      value={sortString}
                      onChange={(e) => setSortString(e.target.value)}
                    >
                      <option value="createdAt|-1">Mới nhất</option>
                      <option value="createdAt|1">Cũ nhất</option>
                      <option value="price|1">Giá tăng dần</option>
                      <option value="price|-1">Giá giảm dần</option>
                      <option value="discount|-1">Giảm giá nhiều nhất</option>
                    </select>
                  </div>

                  <div className={styles.currentSort}>
                    <Badge bg="secondary" className={styles.sortBadge}>
                      {getSortDisplayName(sortString)}
                    </Badge>
                  </div>
                </div>

                {/* Products Grid */}
                <div className={styles.productsSection}>
                  {loading ? (
                    <div className={styles.loadingContainer}>
                      <Loading />
                      <p className={styles.loadingText}>Đang tải sản phẩm...</p>
                    </div>
                  ) : bookData.books && bookData.books.length > 0 ? (
                    <Row className={styles.productsGrid}>
                      {bookData.books.map((book, index) => (
                        <Col xl={3} lg={4} md={6} sm={6} xs={6} key={book._id}>
                          <div
                            className={styles.productWrapper}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <BookItem data={book} boxShadow />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <div className={styles.noProducts}>
                      <div className={styles.noProductsIcon}>📚</div>
                      <h3>Không tìm thấy sản phẩm nào</h3>
                      <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      {genresChecked.length > 0 && (
                        <Button
                          variant="primary"
                          onClick={clearAllFilters}
                          className={styles.resetFilters}
                        >
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {!loading && bookData.totalPage > 1 && (
                  <div className={styles.paginationSection}>
                    <PaginationBookStore
                      totalPage={bookData.totalPage}
                      currentPage={page}
                      onChangePage={handleChangePage}
                    />
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
