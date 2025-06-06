import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Card, Row, Col, InputGroup, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlineMan,
  AiOutlineWoman,
} from "react-icons/ai";
import { updateFullName } from "../../redux/actions/auth";
import userApi from "../../api/userApi";
import styles from "./Account.module.css";

export default function Profile() {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        setIsLoading(true);
        const res = await userApi.getById(currentUser.userId);
        const data = res.data;
        setProfile({
          _id: data._id,
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          birthday: data.birthday,
        });
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    if (currentUser?.userId) {
      fetchDataUser();
    }
  }, [currentUser]);

  const formik = useFormik({
    initialValues: {
      fullName: profile.fullName ? profile.fullName : "",
      phoneNumber: profile.phoneNumber ? profile.phoneNumber : "",
      gender: profile && profile.gender,
      birthday: profile.birthday ? profile.birthday : "",
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      fullName: Yup.string().required("Không được bỏ trống trường này!"),
      phoneNumber: Yup.string()
        .required("Không được bỏ trống trường này!")
        .test("VALID", "Số điện thoại không đúng định dạng!", (value) => {
          const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
          return regex.test(value);
        }),
      gender: Yup.number().required("Không được bỏ trống trường này!"),
      birthday: Yup.string().required("Không được bỏ trống trường này!"),
    }),
    onSubmit: async () => {
      console.log("kiem tra", formik.values);
      const { fullName, gender, phoneNumber, birthday } = formik.values;

      try {
        setIsLoading(true);
        const result = await userApi.updateById(profile._id, {
          fullName,
          gender,
          phoneNumber,
          birthday,
        });
        dispatch(updateFullName({ fullName: result.data.fullName }));
        toast.success("Cập nhật thành công!", { autoClose: 2000 });
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { autoClose: 2000 });
        console.log(error);
      }
    },
  });

  return (
    <div className={styles.profileContainer}>
      {/* Profile Header */}
      <Card className={styles.profileCard}>
        <Card.Header className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  <AiOutlineUser className={styles.avatarIcon} />
                </div>
              </div>
              <div className={styles.userInfo}>
                <h4 className={styles.userName}>
                  {profile.fullName || "Người dùng"}
                </h4>
                <p className={styles.userEmail}>{profile.email}</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <AiOutlineEdit className={styles.editIcon} />
              <span className={styles.editText}>Chỉnh sửa thông tin</span>
            </div>
          </div>
        </Card.Header>

        <Card.Body className={styles.profileBody}>
          <form onSubmit={formik.handleSubmit}>
            <Row className="g-4">
              {/* Email Field */}
              <Col md={12}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <AiOutlineMail className={styles.labelIcon} />
                    Email
                  </label>
                  <InputGroup className={styles.inputGroup}>
                    <InputGroup.Text className={styles.inputAddon}>
                      <AiOutlineMail />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      className={`${styles.formControl} ${styles.readOnlyField}`}
                      placeholder="Email"
                      value={profile && profile.email ? profile.email : ""}
                      readOnly
                    />
                  </InputGroup>
                  <small className={styles.fieldNote}>
                    Email không thể thay đổi
                  </small>
                </div>
              </Col>

              {/* Full Name Field */}
              <Col md={6}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <AiOutlineUser className={styles.labelIcon} />
                    Họ và tên *
                  </label>
                  <InputGroup className={styles.inputGroup}>
                    <InputGroup.Text className={styles.inputAddon}>
                      <AiOutlineUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      id="fullName"
                      name="fullName"
                      className={`${styles.formControl} ${
                        formik.errors.fullName
                          ? styles.errorField
                          : formik.values.fullName
                          ? styles.validField
                          : ""
                      }`}
                      placeholder="Nhập họ và tên"
                      value={formik.values.fullName}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                  </InputGroup>
                  {formik.errors.fullName && (
                    <div className={styles.errorFeedback}>
                      {formik.errors.fullName}
                    </div>
                  )}
                </div>
              </Col>

              {/* Phone Number Field */}
              <Col md={6}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <AiOutlinePhone className={styles.labelIcon} />
                    Số điện thoại *
                  </label>
                  <InputGroup className={styles.inputGroup}>
                    <InputGroup.Text className={styles.inputAddon}>
                      <AiOutlinePhone />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      className={`${styles.formControl} ${
                        formik.errors.phoneNumber
                          ? styles.errorField
                          : formik.values.phoneNumber
                          ? styles.validField
                          : ""
                      }`}
                      placeholder="Nhập số điện thoại"
                      value={formik.values.phoneNumber}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                  </InputGroup>
                  {formik.errors.phoneNumber && (
                    <div className={styles.errorFeedback}>
                      {formik.errors.phoneNumber}
                    </div>
                  )}
                </div>
              </Col>

              {/* Gender Field */}
              <Col md={6}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <AiOutlineUser className={styles.labelIcon} />
                    Giới tính *
                  </label>
                  <div className={styles.genderContainer}>
                    <div className={styles.genderOption}>
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        className={styles.genderRadio}
                        value="0"
                        checked={parseInt(formik.values.gender) === 0}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      />
                      <label htmlFor="male" className={styles.genderLabel}>
                        <AiOutlineMan className={styles.genderIcon} />
                        Nam
                      </label>
                    </div>
                    <div className={styles.genderOption}>
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        className={styles.genderRadio}
                        value="1"
                        checked={parseInt(formik.values.gender) === 1}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      />
                      <label htmlFor="female" className={styles.genderLabel}>
                        <AiOutlineWoman className={styles.genderIcon} />
                        Nữ
                      </label>
                    </div>
                  </div>
                  {formik.errors.gender && (
                    <div className={styles.errorFeedback}>
                      {formik.errors.gender}
                    </div>
                  )}
                </div>
              </Col>

              {/* Birthday Field */}
              <Col md={6}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <AiOutlineCalendar className={styles.labelIcon} />
                    Ngày sinh *
                  </label>
                  <InputGroup className={styles.inputGroup}>
                    <InputGroup.Text className={styles.inputAddon}>
                      <AiOutlineCalendar />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      id="birthday"
                      name="birthday"
                      className={`${styles.formControl} ${
                        formik.errors.birthday
                          ? styles.errorField
                          : formik.values.birthday
                          ? styles.validField
                          : ""
                      }`}
                      value={formik.values.birthday}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                  </InputGroup>
                  {formik.errors.birthday && (
                    <div className={styles.errorFeedback}>
                      {formik.errors.birthday}
                    </div>
                  )}
                </div>
              </Col>

              {/* Submit Button */}
              <Col md={12}>
                <div className={styles.submitSection}>
                  <Button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={
                      formik.errors.fullName ||
                      formik.errors.phoneNumber ||
                      formik.errors.birthday ||
                      isLoading
                    }
                  >
                    <AiOutlineSave className={styles.btnIcon} />
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </Button>
                  <p className={styles.submitNote}>
                    * Các trường bắt buộc phải điền
                  </p>
                </div>
              </Col>
            </Row>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
