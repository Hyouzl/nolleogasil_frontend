import KakaoLogin from "react-kakao-login";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import {
  handleEmailLogin,
  handleKakaoLogin,
} from "../../components/users/Login";

function Login() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `http://localhost:8080/oauth2/authorization/google`;
    window.location.href = googleAuthUrl;
  };
  return (
    <div>
      <div className={styles.top}>
        <Top text="로그인 | 회원가입" tmp="login" />
      </div>
      <p />
      <div className={styles.container}>
        <div className={styles.headliner}>
          Welcome to
          <p />
          놀러가실!
        </div>
        <div className={styles.img}>
          <img src="/images/users/login_eat.png" alt="로그인 이미지" />
        </div>
        <div className={styles.btn}>
          <img
            src="/images/users/kakao_login_medium_wide.png"
            alt="카카오 로그인"
            onClick={() => handleGoogleLogin()}
            className={styles.kakaoLogin}
          />
        </div>
        <div className={styles.emailLogin}>
          <Form.Control
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={handleEmailChange}
            className={styles.emailInput}
          />
          <Button
            onClick={() => handleEmailLogin(email, navigate, setErrorMessage)}
            className={`${styles.emailLoginButton} ${styles.customButtonColor}`}
          >
            로그인
          </Button>
        </div>
        {errorMessage && (
          <Row className="justify-content-center">
            <Col xs="auto">
              <Alert variant="danger" className={styles.errorMessage}>
                {errorMessage}
              </Alert>
            </Col>
          </Row>
        )}
      </div>
      <div>
        <UnderBar />
      </div>
    </div>
  );
}
export default Login;
