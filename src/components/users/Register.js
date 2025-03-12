import axios from "axios";
import api from "../../api";

const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url
const testUrl = "http://localhost:8080";
export const handleRegister = async (userInfo, navigate, getUserInfo) => {
  try {
    const response = await api.post(`/api/user/register`, userInfo);
    if (response.status === 201) {
      //사용자 정보 조회
      console.log("response.data ", response.data);
      localStorage.setItem("nickname", response.data.nickname);
      localStorage.setItem("userId", response.data.usersId);

      alert("회원가입이 완료되었습니다.");
      navigate("/users/login");
    }
  } catch (error) {
    console.error("Error during registration: ", error);
  }
};

export const getUserInfo = async (usersId) => {
  try {
    const res = await api.get(`/api/user/info`, null, {
      params: {
        usersId,
      },
    });
    const data = await res.json();

    //localStorage에 사용자 관련 정보 저장
    localStorage.setItem("userInfo", JSON.stringify(data));
    localStorage.setItem("nickname", data.nickname);
    localStorage.setItem("usersId", data.usersId);
  } catch (error) {
    console.errorO("Error during userInfo: ", error);
  }
};
