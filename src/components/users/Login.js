import axios from "axios";
import api from "../../api";

const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

export const handleCommonLogin = async (
  loginId,
  password,
  navigate,
  setErrorMessage
) => {
  setErrorMessage("");
  try {
    const response = await api.post(
      `/api/user/login`,
      { loginId, password },
      { withCredentials: true }
    );
    if (response.status === 200) {
      //사용자 정보 조회

      console.log(response.data);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("nickname", response.data.nickname);
      alert("로그인이 완료되었습니다.");
      navigate("/");
    } else if (response.status === 201) {
      //신규 회원 - 회원가입 페이지로 이동
      navigate("/users/register");
    }
  } catch (error) {
    console.error("Login error: ", error);
    setErrorMessage("로그인 중 오류가 발생했습니다.");
    navigate("/");
  }
};

export const handleKakaoLogin = (kakaoURL) => {
  window.location.href = kakaoURL;
};

const getUserInfo = async (userEmail) => {
  try {
    const res = await fetch(`${apiUrl}/api/user/info?email=${userEmail}`, {
      credentials: "include",
    });
    const data = await res.json();

    //localStroage에 사용자 관련 정보 저장
    localStorage.setItem("login-token", "emailLoginUser");
    localStorage.setItem("userInfo", JSON.stringify(data));
    localStorage.setItem("nickname", data.nickname);
    localStorage.setItem("usersId", data.usersId);
  } catch (error) {
    console.error("Error fetching userInfo: ", error);
  }
};
