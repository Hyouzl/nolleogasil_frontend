import React, { useEffect, useState, useRef } from "react";
import styles from "../chat/MyChatRoomList.module.css";
import Top from "../../components/common/Top";
import ChatRoomByList from "../../components/chat/ChatRoomByList";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import api from "../../api";

const usersId = localStorage.getItem("usersId");
const cache = {}; // 캐시 저장소 역할을 할 객체

function MyChatRoomList() {
  const [chatRoomList, setChatRoomList] = useState([]);

  const [selected, setSelected] = useState("myRooms");
  const [sorted, setSorted] = useState("기본순");
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = "http://localhost:8080";

  const fetchData = (roomType) => {
    const endpoint =
      roomType === "myRooms"
        ? `${apiUrl}/api/chatRoom/myRooms`
        : `${apiUrl}/api/chatRoom/joinedRooms`;
    api
      .get(endpoint, {
        params: {
          sortedBy: sorted,
        },
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        setChatRoomList(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Failed to fetch chat Room.", error);
      });
  };

  useEffect(() => {
    fetchData(selected);
  }, [selected, sorted]);

  // 버튼 클릭 핸들러 함수
  const handleBtnClick = (roomType) => {
    // 여기에 내가 개설한 채팅방을 표시하는 로직 추가
    setSelected(roomType);
    setIsLoading(true);
  };

  const handleDropdownSelect = (key) => {
    switch (key) {
      case "1":
        setSorted("기본순");
        break;
      case "2":
        setSorted("최신순");
        break;
      case "3":
        setSorted("오래된 순");
        break;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "81vh",
        justifyContent: "center",
      }}
    >
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <button
            className={`${styles.btn} ${
              selected === "myRooms" ? styles.selected : ""
            }`}
            onClick={() => handleBtnClick("myRooms")}
          >
            내가 개설한 채팅방
          </button>
          <button
            className={`${styles.btn} ${
              selected === "joinedRooms" ? styles.selected : ""
            }`}
            onClick={() => handleBtnClick("joinedRooms")}
          >
            내가 참여한 채팅방
          </button>
        </div>
        <span className={styles.dropDiv}>
          <Dropdown onSelect={handleDropdownSelect}>
            <Dropdown.Toggle
              variant="success"
              id="dropdown-basic"
              style={{
                fontSize: "14px",
                padding: "5px 10px",
                border: "2px solid #ADCDFD",
                backgroundColor: "white",
                color: "black",
              }}
            >
              {sorted}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ fontSize: "14px" }}>
              <Dropdown.Item eventKey="1">기본순</Dropdown.Item>
              <Dropdown.Item eventKey="2">최신순</Dropdown.Item>
              <Dropdown.Item eventKey="3">오래된 순</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </span>
        {isLoading ? (
          <div className={styles.loadingBox}>
            <img
              className={styles.loadingImg}
              src="/images/common/loading.gif"
              alt="lodaing"
            />
          </div>
        ) : chatRoomList.length === 0 ? (
          <div className={styles.NoContent}>
            <div className={styles.alertImage}>
              <img
                src={`/images/common/alert.png`}
                alt="저장한 여행 정보가 없습니다."
              />
            </div>
            <div className={styles.alertComment}>
              <span>채팅방이 없습니다.</span>
              <p>
                <span>메이트 공고글을 올려보세요!</span>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.chatRoomContainer}>
            {chatRoomList.map((chatRoom, index) => (
              <ChatRoomByList key={index} chatRoom={chatRoom} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyChatRoomList;
