import { Container, Row, Col, Card } from "react-bootstrap";
import BookItem from "../../components/Shop/BookItem";
import bookApi from "../../api/bookApi";
import { useEffect, useState } from "react";
import styles from "./Home.module.css";
import Loading from "../../components/Loading";

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await bookApi.getAll({ page: 1, limit: 12 });
        setBooks(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Khám Phá Thế Giới <span className={styles.highlight}>Sách</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Tìm kiếm và khám phá hàng ngàn cuốn sách hay từ các tác giả nổi
              tiếng
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <h3>1000+</h3>
                <p>Đầu sách</p>
              </div>
              <div className={styles.statItem}>
                <h3>50+</h3>
                <p>Thể loại</p>
              </div>
              <div className={styles.statItem}>
                <h3>10K+</h3>
                <p>Khách hàng</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Latest Products Section */}
      <section className={styles.productsSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Sản phẩm mới nhất</h2>
            <p className={styles.sectionSubtitle}>
              Những cuốn sách mới nhất và được yêu thích nhất
            </p>
          </div>

          <div className={styles.booksList}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Loading />
              </div>
            ) : (
              <Row className={styles.booksRow}>
                {books && books.length > 0 ? (
                  books.map((book, index) => (
                    <Col xl={2} lg={3} md={4} sm={6} xs={6} key={book._id}>
                      <div
                        className={styles.bookItemWrapper}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <BookItem data={book} />
                      </div>
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <div className={styles.noBooks}>
                      <h4>Không tìm thấy sách nào</h4>
                      <p>Vui lòng thử lại sau</p>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Home;
