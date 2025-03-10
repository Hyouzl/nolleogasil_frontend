import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    if (accessToken) {
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem("accessToken", accessToken);
      console.log(accessToken);
      const decoded = jwtDecode(accessToken);
      // 'attributes' 클레임에서 'name' 값 가져오기
      const attributes = decoded.attributes;
      console.log(attributes);
      let nickname;
      if (attributes) {
        if (attributes.provider === "google") {
          nickname = attributes.name;
        } else {
          nickname = attributes.nickname;
        }
        localStorage.setItem("nickname", nickname);
      }
      const userId = params.get("userId");
      localStorage.setItem("userId", userId);

      navigate("/"); // 메인 페이지로 이동
    } else {
      // 오류 처리 로직
      navigate("/login?error=true");
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
};

export default OAuth2RedirectHandler;
