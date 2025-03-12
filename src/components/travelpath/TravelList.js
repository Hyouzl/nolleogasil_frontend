import { useState, useEffect } from "react";
import axios from "axios";
import TravelData from "../../components/travelpath/TravelData";
import styles from "./TravelList.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import api from "../../api";

function TravelList() {
  const [travelDetail, setTravelDetail] = useState([]);
  const [count, setCount] = useState(null);
  const [selected, setSelected] = useState("최신순");
  const apiUrl = "http://localhost:8080"; //backend api url

  const getTravelPathList = () => {
    api
      .get(`/api/travelpath/travelpathList`, {
        params: {
          sortBy: selected,
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.data !== "") {
          setTravelDetail(response.data);
        }
      })
      .catch((error) => {
        window.alert("오류가 발생했습니다. 다시 시도해주세요.");
      });
  };

  const getCountTravelPath = () => {
    api
      .get(`/api/travelpath/count`, { withCredentials: true })
      .then((response) => {
        setCount(response.data);
      })
      .catch((error) => {});
  };
  useEffect(() => {
    getTravelPathList();
    getCountTravelPath();
  }, [selected]);

  const handleCategoryClick = (key) => {
    setSelected("최신순");
  };

  const handleDropdownSelect = (key) => {
    switch (key) {
      case "1":
        setSelected("최신순");
        break;
      case "2":
        setSelected("오래된순");
        break;
      case "3":
        setSelected("지역순");
        break;
    }
  };

  const onDelete = (travelpathId) => {
    //해당 travelpathId 가진 TravelData 카드를 제거
    setTravelDetail((prevTravelDetail) =>
      prevTravelDetail.filter(
        (TravelData) => TravelData.travelpathId !== travelpathId
      )
    );
    //count 감소
    setCount((prevCount) => prevCount - 1);
  };

  return (
    <div className={styles.wholeArea}>
      <div className={styles.dropDownArea}>
        <div className={styles.dropDiv}>
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
              <Dropdown.Item eventKey="1">최신순</Dropdown.Item>
              <Dropdown.Item eventKey="2">오래된순</Dropdown.Item>
              <Dropdown.Item eventKey="3">지역순</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className={styles.contentArea}>
        {count === 0 ? (
          <div>
            <div className={styles.alertImage}>
              <img
                src={`/images/common/alert.png`}
                alt="저장한 여행 정보가 없습니다."
              />
            </div>
            <div className={styles.alertComment}>
              <span>저장한 여행 정보가 없습니다.</span>
            </div>
          </div>
        ) : (
          travelDetail.map((path, index) => (
            <div key={path.travelPathDto.travelpathId}>
              <TravelData
                travelpathId={path.travelPathDto.travelpathId}
                destination={path.travelPathDto.arrival}
                startDate={path.travelPathDto.startDate}
                endDate={path.travelPathDto.endDate}
                party={path.keywordDto.party}
                place={path.keywordDto.place}
                concept={path.keywordDto.concept.split(",")}
                food={path.keywordDto.food.split(",")}
                onDelete={onDelete}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default TravelList;
