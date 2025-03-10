import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TravelPath_Main.module.css";
import Top from "../../components/common/Top";
import ValueButton from "../../components/travelpath/ValueButton";
import Destination from "../../components/travelpath/Destination";
import DateRangePickerValue from "../../components/travelpath/DateRangePickerValue";
import { format } from "date-fns";
import api from "../../api";

function TravelPath_Main() {
  const [nickname, setNickname] = useState(localStorage.getItem("nickname")); //사용자 닉네임
  const [destination, setDestination] = useState(""); //목적지
  const [startDate, setStartDate] = useState(""); //가는 날짜
  const [endDate, setEndDate] = useState(""); //오는 날짜
  const [partyItems, setPartyItems] = useState(new Set()); //인원
  const [placeItems, setPlaceItems] = useState(new Set()); //장소
  const [conceptItems, setConceptItems] = useState(new Set()); //컨셉
  const [foodItems, setFoodItems] = useState(new Set()); //음식
  const [pet, setPet] = useState(false); //반려동물
  const [categoryCheck, setCategoryChecked] = useState({
    party: false,
    place: false,
    concept: false,
    food: false,
  }); //카테고리 check 여부
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //선택된 목적지를 설정
  const destinationChange = (content) => {
    setDestination(content);
  };

  // 선택된 날짜 정보를 설정
  const handleDateRangeChange = (startDate, endDate) => {
    setStartDate(format(startDate, "yyyy/MM/dd"));
    setEndDate(format(endDate, "yyyy/MM/dd"));
  };

  //checkbox 클릭시 해당 checkbox name의 check 여부를 true로 바꿈
  const handleValueButtonChange = (name) => {
    if (categoryCheck)
      setCategoryChecked((prev) => ({
        ...prev,
        [name]: true,
      }));

    const isCategoryEmpty =
      (name === "party" && partyItems.size === 0) ||
      (name === "place" && placeItems.size === 0) ||
      (name === "concept" && conceptItems.size === 0) ||
      (name === "food" && foodItems.size === 0);

    // 선택된 항목이 없는 경우 해당 카테고리를 false로 설정
    setCategoryChecked((prev) => ({
      ...prev,
      [name]: !isCategoryEmpty,
    }));
  };

  //카테고리의 check여부를 확인
  const areCategoriesChecked = () => {
    return Object.values(categoryCheck).every((value) => value);
  };

  //카테고리 check여부에 따라 다른 동작 수행
  const handleButtonClick = async (event) => {
    event.preventDefault();
    try {
      if (!areCategoriesChecked()) {
        window.alert("각 질문마다 최소 한 개 이상의 항목을 선택해주세요.");
      } else if (destination == "") {
        window.alert("목적지를 설정해주세요.");
      } else {
        sendFormData();
      }
    } catch (error) {
      console.error("Checking process is failed: ", error);
    }
  };

  //각각의 체크박스의 checked여부에 따라 체크박스 name에 해당되는 배열에 선택요소를 추가하거나 삭제
  const checkedItemHandler = (name, value, isChecked) => {
    if (isChecked) {
      switch (name) {
        case "party":
          partyItems.add(value);
          setPartyItems(partyItems);
          break;
        case "place":
          placeItems.add(value);
          setPlaceItems(placeItems);
          break;
        case "concept":
          conceptItems.add(value);
          setConceptItems(conceptItems);
          break;
        case "food":
          foodItems.add(value);
          setFoodItems(foodItems);
          break;
      }
    } else if (!isChecked) {
      switch (name) {
        case "party":
          partyItems.delete(value);
          setPartyItems(partyItems);
          break;
        case "place":
          placeItems.delete(value);
          setPlaceItems(placeItems);
          break;
        case "concept":
          conceptItems.delete(value);
          setConceptItems(conceptItems);
          break;
        case "food":
          foodItems.delete(value);
          setFoodItems(foodItems);
          break;
      }
    }
  };

  //post 요청(/form)
  const data = {
    destination: destination,
    startDate: startDate,
    endDate: endDate,
    partyItems: Array.from(partyItems),
    placeItems: Array.from(placeItems),
    conceptItems: Array.from(conceptItems),
    foodItems: Array.from(foodItems),
    pet: pet,
  };
  const sendFormData = () => {
    api
      .post(`/api/travelpath/form`, data, {
        withCredentials: true,
      })
      .then((response) => {
        const conditionDto = response.data;
        localStorage.setItem("conditionDto", JSON.stringify(conditionDto));
        navigate("/travelPath/result");
      })
      .catch((error) => {
        window.alert("오류가 발생했습니다. 다시 시도해주세요.");
      });
  };

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="여행일정" />
      </div>
      <form>
        <div className={styles.travelForm}>
          {nickname == null ? (
            <span className={styles.questionMain}>
              어떠한 여행을 준비하고 계신가요?
            </span>
          ) : (
            <span className={styles.questionMain}>
              {nickname}님, 어떠한 여행을 준비하고 계신가요?
            </span>
          )}
          <div className={styles.division}>
            <p className={styles.questions}>이번 여행은 어디로 가시나요?</p>
            <div className={styles.section}>
              <Destination onVariableChange={destinationChange} />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>언제 출발하시나요? </p>
            <div className={styles.section}>
              <DateRangePickerValue onRangeChange={handleDateRangeChange} />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>
              함께하는 일행은?
              <span className={styles.guide}>(다중 선택 가능)</span>
            </p>
            <div className={styles.section}>
              <ValueButton
                name="party"
                text="혼자서"
                img="alone"
                value="혼자서"
                onChange={() => handleValueButtonChange("party")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="party"
                text="친구들과"
                img="friends"
                value="친구들과"
                onChange={() => handleValueButtonChange("party")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="party"
                text="부모님과"
                img="family"
                value="부모님과"
                onChange={() => handleValueButtonChange("party")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="party"
                text="애인과"
                img="partner"
                value="애인과"
                onChange={() => handleValueButtonChange("party")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>
              선호하는 장소는?
              <span className={styles.guide}>(다중 선택 가능)</span>
            </p>
            <div className={styles.section}>
              <ValueButton
                name="place"
                text="바다"
                img="sea"
                value="바다"
                onChange={() => handleValueButtonChange("place")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="place"
                text="산"
                img="mountain"
                value="산"
                onChange={() => handleValueButtonChange("place")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="place"
                text="도심"
                img="cityscape"
                value="도심"
                onChange={() => handleValueButtonChange("place")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>
              이번 여행 컨셉은?
              <span className={styles.guide}>(다중 선택 가능)</span>
            </p>
            <div className={styles.section}>
              <ValueButton
                name="concept"
                text="호캉스"
                img="hotelvaca"
                value="호캉스"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="concept"
                text="관광"
                img="travelnocolor"
                value="관광"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="concept"
                text="레저스포츠"
                img="activity"
                value="레저스포츠"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
            <div className={styles.section}>
              <ValueButton
                name="concept"
                text="캠핑"
                img="camping"
                value="캠핑"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="concept"
                text="먹부림"
                img="eating"
                value="먹부림"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="concept"
                text="하이킹"
                img="hiking"
                value="하이킹"
                onChange={() => handleValueButtonChange("concept")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>
              여행 중 먹고싶은 음식은?
              <span className={styles.guide}>(다중 선택 가능)</span>
            </p>
            <div className={styles.section}>
              <ValueButton
                name="food"
                text="백반"
                img="backban"
                value="백반"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="분식"
                img="ricecake"
                value="분식"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="국수/면"
                img="noodle"
                value="국수/면"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="한정식"
                img="hanjungsik"
                value="한정식"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
            <div className={styles.section}>
              <ValueButton
                name="food"
                text="일식"
                img="japan"
                value="일식"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="중식"
                img="chinese"
                value="중식"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="피자/파스타"
                img="pizza"
                value="피자/파스타"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="햄버거"
                img="burger"
                value="햄버거"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
            <div className={styles.section}>
              <ValueButton
                name="food"
                text="생선"
                img="fish"
                value="생선"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="해물탕/해물찜"
                img="seafood"
                value="해물탕/해물찜"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="게"
                img="crab"
                value="게"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="회/조개"
                img="sashimi"
                value="회/조개"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
            <div className={styles.section}>
              <ValueButton
                name="food"
                text="곱창/막창"
                img="gopchang"
                value="곱창/막창"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="돼지고기"
                img="pork"
                value="돼지고기"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="소고기"
                img="beef2"
                value="소고기"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
              <ValueButton
                name="food"
                text="닭고기"
                img="chickenleg"
                value="닭고기"
                onChange={() => handleValueButtonChange("food")}
                checkedItemHandler={checkedItemHandler}
              />
            </div>
          </div>
          <div className={styles.division}>
            <p className={styles.questions}>반려동물과 함께하시나요?</p>
            <input
              type="radio"
              name="pet"
              value="1"
              className={styles.radioBtn}
              onChange={() => {
                setPet(true);
              }}
              checked={pet}
            />
            <span className={styles.radioValue}>예</span>
            <input
              type="radio"
              name="pet"
              value="0"
              className={styles.radioBtn}
              onChange={() => {
                setPet(false);
              }}
              checked={!pet}
            />
            <span className={styles.radioValue}>아니오</span>
          </div>
        </div>
        <div className={styles.underBarContainer}>
          <button
            type="submit"
            className={styles.searchBtn}
            onClick={handleButtonClick}
          >
            '로더'에게 여행일정 추천받기
          </button>
        </div>
      </form>
    </div>
  );
}
export default TravelPath_Main;
