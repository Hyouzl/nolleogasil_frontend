import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const Logout = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url
  const backend_url = "http://localhost:8080";
  // 1️⃣ CSRF 토큰 가져오기 (쿠키에서 추출)

  console.log(document.cookie);
  useEffect(() => {
    async function logoutUser() {
      try {
        await api.post(`/api/users/logout`);
        // 로그아웃 성공 시 로컬 스토리지 정보 삭제
        localStorage.removeItem("accessToken");
        localStorage.removeItem("nickname");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userId");

        alert("로그아웃되었습니다!");
        navigate("/"); // 메인 페이지로 이동
      } catch (error) {
        console.error("로그아웃 오류: ", error);
      }
    }

    logoutUser();
  }, [navigate]);

  return null;
};
export default Logout;
