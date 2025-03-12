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
      alert("로그인이 완료되었습니다.");

      console.log(response.data.result);
      localStorage.setItem("accessToken", response.data.result.accessToken);
      localStorage.setItem("userId", response.data.result.userId);
      localStorage.setItem("nickname", response.data.result.nickname);
      alert("로그인이 완료되었습니다.");
      navigate("/");
    }
  } catch (error) {
    // ✅ 서버 응답이 있는 경우 (에러 코드 기반 처리)
    if (error.response) {
      alert(error.response);
      console.error("Login error: ", error.response);
      if (error.response.data?.code === "MEMBER201") {
        alert("신규 회원입니다. 회원가입 페이지로 이동합니다.");
        navigate("/users/register");
      } else if (error.response.status === 401) {
        setErrorMessage("아이디 또는 비밀번호가 잘못되었습니다.");
        navigate("/users/login");
      } else {
        setErrorMessage("서버 오류가 발생했습니다.");
      }
    }
    setErrorMessage("로그인 중 오류가 발생했습니다.");
  }
};

export const handleKakaoLogin = (kakaoURL) => {
  window.location.href = kakaoURL;
};
