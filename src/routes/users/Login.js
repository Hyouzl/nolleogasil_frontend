import KakaoLogin from "react-kakao-login";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { handleCommonLogin } from "../../components/users/Login";

function Login() {
  const [loginId, setLoginId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLoginIdChange = (e) => {
    setLoginId(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  /** 
  const KAKAO_CLIENT_ID = "7742335c4d85535f308e11de30644e4c"; // 카카오 디벨로퍼에서 발급받은 REST API 키
  const KAKAO_REDIRECT_URI =
    "https://www.nolleogasil.shop/oauth/kakao/callback"; // 카카오 디벨로퍼에서 설정한 Redirect URI
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    KAKAO_REDIRECT_URI
  )}`; */
  const handleGoogleLogin = async () => {
    window.location.href =
      "https://api.nolleogasil.shop/oauth2/authorization/google";
  };

  const handleKakaoLogin = async () => {
    window.location.href =
      "https://api.nolleogasil.shop/oauth2/authorization/kakao";
  };

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="로그인 | 회원가입" tmp="login" />
      </div>
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
          <Button
            className={styles.kakaoButton}
            onClick={() => handleKakaoLogin()}
          >
            <img src="/images/users/2111466.png" alt="카카오 로그인" />
            카카오 로그인
          </Button>
          <Button
            className={styles.googleButton}
            onClick={() => handleGoogleLogin()}
          >
            <img
              src="/images/users/png-clipart-google-logo-google-g-logo-icons-logos-emojis-tech-companies-thumbnail.png"
              alt="구글 로그인"
            />
            구글 로그인
          </Button>
        </div>
        <div className={styles.emailLogin}>
          <Form.Control
            type="email"
            placeholder="이메일 입력"
            value={loginId}
            onChange={handleLoginIdChange}
            className={styles.formControl}
          />
          <Form.Control
            type="password"
            name="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            className={styles.formControl}
          />
          <Button
            onClick={() =>
              handleCommonLogin(loginId, password, navigate, setErrorMessage)
            }
            className={`${styles.customButtonColor}`}
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
      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}
export default Login;
