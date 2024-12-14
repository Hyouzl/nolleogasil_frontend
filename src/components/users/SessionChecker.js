import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SessionChecker.module.css";

const SessionChecker = ({ children }) => {
  const [sessionValid, setSessionValid] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedAccessToken) {
        // 로그인 상태일 경우
        setIsLoggedIn(true);
      } else {
        // 비로그인 상태일 경우
        alert("로그인 후 이용 가능합니다.");
        setIsLoggedIn(false);
        navigate("/users/login"); // 로그인 페이지로 이동
      }
    };

    const checkSession = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/session/check`, {
          withCredentials: true,
        });
        // 세션 유효성에 따라 상태 업데이트
        if (response.status === 200) {
          console.log("session valid true");
          setSessionValid(true);
        } else {
          console.log("session valid false");
          setSessionValid(false);
          navigate("/users/login"); // 로그인 페이지로 이동
        }
      } catch (error) {
        console.log("Error checking session: ", error);
        setSessionValid(false);
        navigate("/users/login"); // 로그인 페이지로 이동
      }
    };

    // 페이지가 로드될 때 로그인 상태 확인
    checkLoginStatus();

    // 로그인 상태일 때만 세션 확인
    if (isLoggedIn) {
      checkSession();
    }
  }, [isLoggedIn, navigate]);

  if (sessionValid === null) {
    return (
      <div className={styles.loadingBox}>
        <img
          className={styles.loadingImg}
          src={`/images/common/loading.gif`}
          alt="loading"
        />
      </div>
    );
  }

  // 세션이 유효하지 않을 경우
  if (isLoggedIn && !sessionValid) {
    // 세션과 관련된 로컬 스토리지 데이터 삭제
    localStorage.removeItem("login-token");
    localStorage.removeItem("nickname");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("usersId");
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    navigate("/users/login", { replace: true });
    return null;
  }

  // 로그인 상태이면서 세션이 유효한 경우 혹은 비로그인 상태인 경우
  return children;
};

export default SessionChecker;
