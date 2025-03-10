import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; //Bootstrap css파일을 요구하는 경우가 있음
import styles from "./Main.module.css";
import SlideImg from "../components/common/SlideImg";
import Button from "../components/common/Button";
import UnderBar from "../components/common/UnderBar";
import NotificationComponent from "../components/ NotificationComponent";

function Main() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");

  const checkLoginStatus = async () => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    console.log("storedUserId: ", storedUserId);
    if (storedAccessToken) {
      //로그인 상태일 경우
      setIsLoggedIn(true);
      setNickname(localStorage.getItem("nickname"));
    } else {
      //비로그인 상태일 경우
      setIsLoggedIn(false);
    }
  };

  //페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
    const myPageActiveTab = localStorage.getItem("activeTab");
    if (myPageActiveTab) {
      localStorage.removeItem("activeTab");
    }
  }, []);

  // 닉네임이 5글자 이상인 경우 말 줄임표 처리
  const formattedNickname =
    nickname.length > 5 ? nickname.substring(0, 5) + "..." : nickname;

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Link to="/nolloegasil/info">
          <span className={styles.logo}>놀러가실?</span>
        </Link>

        <span className={styles.optional}>
          {isLoggedIn ? (
            <span>
              {formattedNickname}님 |{" "}
              <Link to="users/logout" className={styles.linkText}>
                로그아웃
              </Link>
            </span>
          ) : (
            <div>
              <Link to="/users/login" className={styles.linkText}>
                로그인
              </Link>
              {" | "}
              <Link to="/users/register" className={styles.linkText}>
                회원가입
              </Link>
            </div>
          )}
        </span>
      </div>
      <div className={styles.subBody}>
        <div className={styles.slideImg}>
          <SlideImg />
        </div>
        <div className={styles.btnContainer}>
          <div className={styles.btnBox}>
            <div className={styles.btns}>
              <Button text="맛집" img="restaurant" link="/map/restaurant" />
            </div>
            <div className={styles.btns}>
              <Button text="카페" img="cafe" link="/map/cafe" />
            </div>
            <div className={styles.btns}>
              <Button text="숙소" img="lodging" link="/map/lodging" />
            </div>

            <div className={styles.btns}>
              <Button text="관광지" img="attraction" link="/map/attraction" />
            </div>
            <div className={styles.btns}>
              <Button text="맛집메이트" img="mate" link="/eatMate" />
            </div>
            <div className={styles.btns}>
              <Button text="여행일정" img="travelPath" link="/travelPath" />
            </div>
          </div>
        </div>
      </div>
      {/* UnderBar를 가운데 정렬 */}
      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default Main;
