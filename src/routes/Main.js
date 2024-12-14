import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; //Bootstrap css파일을 요구하는 경우가 있음
import styles from "./Main.module.css";
import SlideImg from "../components/common/SlideImg";
import Button from "../components/common/Button";
import UnderBar from "../components/common/UnderBar";

function Main() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");

  const checkLoginStatus = async () => {
    const storedAccessToken = localStorage.getItem("accessToken");

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
    <div>
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
            <Link to="users/login" className={styles.linkText}>
              로그인 | 회원가입
            </Link>
          )}
        </span>
      </div>

      <div className={styles.subBody}>
        <div>
          <SlideImg />
        </div>
        <div>
          <table className={styles.btnBox}>
            <tbody>
              <tr>
                <td className={styles.btns}>
                  <Button text="맛집" img="restaurant" link="/map/restaurant" />
                </td>
                <td className={styles.btns}>
                  <Button text="카페" img="cafe" link="/map/cafe" />
                </td>
                <td className={styles.btns}>
                  <Button text="숙소" img="lodging" link="/map/lodging" />
                </td>
              </tr>
              <tr>
                <td className={styles.btns}>
                  <Button
                    text="관광지"
                    img="attraction"
                    link="/map/attraction"
                  />
                </td>
                <td className={styles.btns}>
                  <Button text="맛집메이트" img="mate" link="/eatMate" />
                </td>
                <td className={styles.btns}>
                  <Button text="여행일정" img="travelPath" link="/travelPath" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <UnderBar />
      </div>
    </div>
  );
}

export default Main;
