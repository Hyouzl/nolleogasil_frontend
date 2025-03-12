import { useState, useEffect } from "react";
import Top from "../../components/common/Top";
import Mate from "../../components/mate/Mate";
import UnderBar from "../../components/common/UnderBar";
import styles from "./Mate_Main.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useGeolocation from "../../components/kakao/useGeolocation.tsx";
import Dropdown from "react-bootstrap/Dropdown";
import api from "../../api";

function Mate_Main() {
  const [mateList, setMateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeCat, setPlaceCat] = useState(0);
  const [selected, setSelected] = useState("날짜순");
  const navigate = useNavigate();
  const current = useGeolocation();
  const latitude = current.loaded ? current.coordinates.lat : 33.450701;
  const longitude = current.loaded ? current.coordinates.lng : 126.570667;
  const apiUrl = "http://localhost:8080"; //backend api url

  //지도에서 장소 이름 클릭 시, 넘어오는 placeId
  let placeId = 0;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams) {
    placeId = Number(urlParams.get("placeId"));
  }

  //mate 목록 조회
  const getMateList = () => {
    api
      .get(`/api/mate`, {
        params: {
          placeId: placeId,
          placeCat: placeCat,
          currentLat: latitude,
          currentLng: longitude,
          sorted: selected,
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setMateList(response.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
          alert("일시적인 오류가 발생했습니다. 다시 접속해주세요.");
        } else {
          console.error("Error getMateList>> ", error.message);
          alert("서버 오류가 발생했습니다. 다시 접속해주세요.");
        }
      });
  };

  useEffect(() => {
    getMateList();
  }, [selected, placeCat]);

  //돌아가기 버튼 클릭 시
  const goBackBtnClickHandler = () => {
    navigate(-1);
  };

  //카테고리(전체, 식당, 카페) 선택 시
  const handleCategoryClick = (key) => {
    setPlaceCat(key);
    setSelected("날짜순");
  };

  //드롭다운 선택 시
  const handleDropdownSelect = (key) => {
    switch (key) {
      case "1":
        setSelected("날짜순");
        break;
      case "2":
        setSelected("거리순");
        break;
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="맛집메이트" />
      </div>

      <div className={styles.subBody}>
        {/*메인화면에서 접근했다면, placeId: 0 // 전체 장소에 대한 맛집메이트 조회*/}
        {placeId === 0 ? (
          <div>
            <div className={styles.category}>
              <button
                onClick={() => handleCategoryClick(0)}
                className={
                  placeCat === 0 ? styles.selected : styles.categoryBtn
                }
              >
                전체
              </button>
              <button
                onClick={() => handleCategoryClick(1)}
                className={
                  placeCat === 1 ? styles.selected : styles.categoryBtn
                }
              >
                맛집
              </button>
              <button
                onClick={() => handleCategoryClick(2)}
                className={
                  placeCat === 2 ? styles.selected : styles.categoryBtn
                }
              >
                카페
              </button>
            </div>

            <span className={styles.dropDownBox}>
              <Dropdown onSelect={handleDropdownSelect}>
                <Dropdown.Toggle
                  variant="success"
                  id="dropdown-basic"
                  style={{
                    fontSize: "14px",
                    padding: "5px 10px",
                    border: "3px solid #ADCDFD",
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  {selected}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ fontSize: "14px" }}>
                  <Dropdown.Item eventKey="1">날짜순</Dropdown.Item>
                  <Dropdown.Item eventKey="2">거리순</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </span>
          </div>
        ) : (
          ""
        )}

        {loading ? (
          <div className={styles.loadingBox}>
            <img
              className={styles.loadingImg}
              src="/images/common/loading.gif"
              alt="lodaing"
            />
          </div>
        ) : mateList.length === 0 ? (
          <div className={styles.alertBox}>
            <img
              src="/images/common/alert.png"
              alt="알림"
              className={styles.alertImg}
            />
            <p />
            <span className={styles.alertMessage}>
              {placeId === 0
                ? "맛집메이트 공고글이 없습니다."
                : "해당 장소의 공고 글이 없습니다."}
              <br />
              맛집메이트를 모집해보세요!
            </span>
            <p />
            {placeId === 0 ? (
              ""
            ) : (
              <button
                className={styles.goBackBtn}
                onClick={goBackBtnClickHandler}
              >
                돌아가기
              </button>
            )}
          </div>
        ) : (
          <div>
            {mateList.map((mate) => (
              <Mate key={mate.mateId} mate={mate} place={mate.place} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar
          left="보낸 신청"
          leftLink="/eatMate/sendApply"
          right="받은 신청"
          rightLink="/eatMate/receiveApply"
        />
      </div>
    </div>
  );
}

export default Mate_Main;
