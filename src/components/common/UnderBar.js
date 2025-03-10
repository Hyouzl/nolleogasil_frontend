import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./UnderBar.module.css";

function UnderBar({ left, leftLink, right, rightLink }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usersId, setUsersId] = useState(null);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUsersId = localStorage.getItem("userId");

    if (storedAccessToken) {
      setIsLoggedIn(true);
      if (storedUsersId) setUsersId(parseInt(storedUsersId));
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className={styles.under}>
      {/* 왼쪽 버튼 */}
      <Link to={left ? leftLink : "/chat/chatList"}>
        <span className={styles.leftBtn}>{left ? left : "채팅"}</span>
      </Link>

      {/* 홈 버튼 */}
      <Link to="/">
        <span className={styles.homeBtn}>홈</span>
      </Link>

      {/* 오른쪽 버튼 */}
      <Link
        to={
          right ? rightLink : isLoggedIn ? `/myPage/${usersId}` : "/users/login"
        }
      >
        <span className={styles.rightBtn}>{right ? right : "마이페이지"}</span>
      </Link>
    </div>
  );
}

export default UnderBar;
