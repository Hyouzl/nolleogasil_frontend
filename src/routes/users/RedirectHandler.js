import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code"); // 인가 코드 추출

    if (authorizationCode) {
      fetch(
        `https://api.partnerd.site/api/auth/login/kakao?code=${authorizationCode}`,
        {
          method: "GET", // GET 요청 사용
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem("token", data.jwtToken); // JWT 저장
          navigate("/"); // 로그인 후 메인 페이지로 이동
          console.log(data.result.email);
        })
        .catch((error) => console.error("카카오 로그인 실패", error));
    }
  }, []);

  return <div>로그인 중...</div>;
};

export default RedirectHandler;
