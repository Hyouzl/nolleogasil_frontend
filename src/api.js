import axios from "axios";

console.log("📌 현재 Access Token:", localStorage.getItem("accessToken"));
// https://api.nolleogasil.shop/
// http://localhost:8080/
const api = axios.create({
  baseURL: "http://localhost:8080/", // 백엔드 API 주소
  withCredentials: true, // ✅ 쿠키 포함 (Refresh Token 자동 전송)
});

// ✅ 요청 인터셉터 (Access Token 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshingToken = false; // ✅ 현재 refresh 요청 중인지 상태
let refreshSubscribers = []; // ✅ refresh 요청 중 다른 요청들이 대기하는 배열

// ✅ 새로 발급된 액세스 토큰을 모든 대기 요청에 적용
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// ✅ 응답 인터셉터 (Access Token 만료 시 자동 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    alert("로그인을 해주세요!");

    // 500 에러 처리
    if (error.response?.status === 500) {
      console.error("❌ 500 에러 발생. 로그아웃 처리");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.log("로그인을 먼저 해주세요.");
      window.location.href = "/users/login";
    }

    // ✅ 401 에러 발생 && refreshToken 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      // ✅ 이미 refresh 요청이 진행 중이면 기존 refreshSubscribers에 등록하여 기다리기
      if (isRefreshingToken) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshingToken = true;

      try {
        console.log("📌 Refresh Token을 사용하여 Access Token 재발급 시도");

        console.log("userId:", localStorage.getItem("userId"));
        const userId = localStorage.getItem("userId");
        // ✅ Refresh Token 요청
        const refreshResponse = await axios.post(
          "https://api.nolleogasil.shop/api/users/refresh",
          null,
          {
            params: { userId: userId }, // ✅ 쿼리스트링으로 userId 전달
            withCredentials: true, // ✅ 쿠키 포함 (Refresh Token 자동 전송)
          }
        );

        if (refreshResponse.status === 200) {
          console.log(refreshResponse.data);
          const newAccessToken = refreshResponse.data;
          localStorage.setItem("accessToken", newAccessToken);

          // ✅ 새로 발급된 액세스 토큰을 대기 중인 요청들에 적용
          onRefreshed(newAccessToken);

          // ✅ 원래 요청에 새로운 토큰을 추가하고 재시도
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh Token이 만료되었습니다. 다시 로그인 필요");
        localStorage.removeItem("accessToken");
        window.alert("오류가 발생했습니다. 다시 시도해주세요.");
        window.location.href = "/users/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
