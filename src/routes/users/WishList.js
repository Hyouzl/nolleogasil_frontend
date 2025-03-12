import { useState, useEffect } from "react";
import Wish from "../../components/users/Wish";
import styles from "./WishList.module.css";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import api from "../../api";

function WishList() {
  const [wishList, setWishList] = useState([]);
  const [placeCat, setPlaceCat] = useState(0);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState("기본순");
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //찜 해제 버튼 클릭 시, wish에서 제거 후, wishList에서도 제거
  const onDelete = (wishId) => {
    //해당 wishId를 가진 Wish 카드를 wishList에서 제거
    setWishList((prevWishList) =>
      prevWishList.filter((wish) => wish.wishId !== wishId)
    );
    //count 감소
    setCount((prevCount) => prevCount - 1);
  };

  //로그인한 사용자의 '내 장소'(wishList) 조회
  const getWishList = () => {
    api
      .get(`/api/wish/${placeCat}`, {
        params: {
          sortBy: selected,
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setWishList(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getWishList>> ", error.message);
        }
      });
  };

  //wish에 담긴 개수 조회
  const getCountWish = () => {
    api
      .get(`/api/wish/${placeCat}/count`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setCount(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getWishList>> ", error.message);
        }
      });
  };
  useEffect(() => {
    getCountWish();
    getWishList();
  }, [placeCat, selected]);

  //카테고리(전체, 식당, 카페, 숙소, 관광지) 클릭 시
  const handleCategoryClick = (key) => {
    setPlaceCat(key);
    setSelected("기본순");
  };

  //드롭다운 선택 시
  const handleDropdownSelect = (key) => {
    switch (key) {
      case "1":
        setSelected("기본순");
        break;
      case "2":
        setSelected("최신순");
        break;
      case "3":
        setSelected("오래된 순");
        break;
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.category}>
        <button
          onClick={() => handleCategoryClick(0)}
          className={placeCat === 0 ? styles.selected : styles.categoryBtn}
        >
          전체
        </button>
        <button
          onClick={() => handleCategoryClick(1)}
          className={placeCat === 1 ? styles.selected : styles.categoryBtn}
        >
          맛집
        </button>
        <button
          onClick={() => handleCategoryClick(2)}
          className={placeCat === 2 ? styles.selected : styles.categoryBtn}
        >
          카페
        </button>
        <button
          onClick={() => handleCategoryClick(3)}
          className={placeCat === 3 ? styles.selected : styles.categoryBtn}
        >
          숙소
        </button>
        <button
          onClick={() => handleCategoryClick(4)}
          className={placeCat === 4 ? styles.selected : styles.categoryBtn}
        >
          관광지
        </button>
        <span className={styles.count}>총 {count}곳</span>
        <span className={styles.dropBox}>
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
              {selected}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ fontSize: "14px" }}>
              <Dropdown.Item eventKey="1">기본순</Dropdown.Item>
              <Dropdown.Item eventKey="2">최신순</Dropdown.Item>
              <Dropdown.Item eventKey="3">오래된 순</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </span>
      </div>

      {wishList.length === 0 ? (
        <div className={styles.alertBox}>
          <img
            src="/images/common/alert.png"
            alt="알림"
            className={styles.alertImg}
          />
          <p />
          <span className={styles.alertMessage}>저장한 장소가 없습니다.</span>
        </div>
      ) : (
        <div className={styles.ListBox}>
          {wishList.map((wish) => (
            <Wish
              key={wish.wishId}
              wishId={wish.wishId}
              place={wish.place}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishList;
