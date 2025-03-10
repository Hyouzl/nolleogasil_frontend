import React, { useEffect, useState } from "react";
import styles from "./ChatRoom.module.css";
import api from "../../api";

const Sidebar = ({ isOpen, chatRoom, closeSidebar }) => {
  const [members, setMembers] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(chatRoom.chatroomId);
  useEffect(() => {
    if (isOpen) {
      api
        .get(`/api/mateMember/${chatRoom.mateId}`, { withCredentials: true })
        .then((response) => {
          console.log("response.data: ", response.data);
          setMembers(response.data);
        })
        .catch((error) => console.error("Failed to fetch chat members", error));
    }
  }, [isOpen, chatRoomId]);

  return (
    <>
      {/* ✅ 오버레이 추가 (배경 클릭 시 닫기) */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={closeSidebar}
      />

      {/* ✅ 사이드바 (오버레이 위에 뜨도록 설정) */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={closeSidebar}>
          ✖
        </button>
        <h3>
          참가 멤버 ({chatRoom.memberCnt} / {chatRoom.maxNum})
        </h3>
        <ul>
          {members.map((member, idx) => (
            <li key={idx}>{member.nickname}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
