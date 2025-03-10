import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import styles from "./Register.module.css";
import { handleRegister, getUserInfo } from "../../components/users/Register";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: location.state?.email,
    nickname: "",
    phone: "",
    gender: "",
    mateTemp: 36.5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="회원가입" tmp="register" />
      </div>
      <p />
      <div className={styles.container}>
        <Container>
          <div className={styles.headliner}>회원가입</div>
          <Form>
            {/* 로그인 ID */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="text"
                name="loginId"
                placeholder="아이디"
                value={userInfo.loginId}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 비밀번호 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="password"
                name="password"
                placeholder="비밀번호"
                value={userInfo.password}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 이름 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="text"
                name="name"
                placeholder="이름"
                value={userInfo.name}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 이메일 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="email"
                name="email"
                placeholder="이메일"
                value={userInfo.email}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 닉네임 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="text"
                name="nickname"
                placeholder="닉네임"
                value={userInfo.nickname}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 전화번호 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                type="text"
                name="phone"
                placeholder="전화번호"
                value={userInfo.phone}
                onChange={handleChange}
                className={styles.formControl}
              />
            </Form.Group>

            {/* 성별 선택 */}
            <Form.Group className={styles.formGroup}>
              <Form.Control
                as="select"
                name="gender"
                value={userInfo.gender}
                onChange={handleChange}
                className={styles.formControl}
              >
                <option value="">성별 선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </Form.Control>
            </Form.Group>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => handleRegister(userInfo, navigate, getUserInfo)}
                className={`${styles.registerButton} ${styles.customButtonColor}`}
              >
                회원가입
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                취소
              </Button>
            </div>
          </Form>
        </Container>
      </div>
      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
};

export default Register;
