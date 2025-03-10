import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Result.module.css";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import Conditions from "../../components/travelpath/Conditions";
import axios from "axios";
import api from "../../api";

function Result() {
  const [getResponse, setGetResponse] = useState(null); //폼 입력에서 받은 데이터들을 저장할 변수
  const [postResponse, setPostResponse] = useState(null); //chatGpt 응답을 저장할 변수
  const [dates, setDates] = useState([]); //날짜 리스트
  const [infos, setInfos] = useState([]); //응답 리스트
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //폼 입력에서 선택한 데이터 가져오는 함수
  useEffect(() => {
    setGetResponse(JSON.parse(localStorage.getItem("conditionDto")));
  }, []);

  //chatGPT API 사용을 위해 post 요청하는 함수
  const askData = () => {
    const promptMessage = `${getResponse.partyItems} ${
      getResponse.startDate
    }부터 ${getResponse.endDate}까지 대한민국  ${
      getResponse.destination
    }에 가려고 합니다.\n
        대한민국 ${getResponse.destination} 외의 다른 장소는 안 돼요.\n
        ${getResponse.startDate}부터 ${
      getResponse.endDate
    }까지 날짜별 그리고 시간대별로 여행일정을 추천받고 싶어요. 꼭 ${
      getResponse.endDate
    }의 여행일정도 추천해주세요.\n
        여행의 컨셉은 ${getResponse.conceptItems.join(", ")}이에요.\n
        또한, ${
          getResponse.destination
        }의 좋은 관광지와 식당 이름을 추천해줬으면 좋겠어요.\n
        관광지로 선호하는 장소는 ${getResponse.placeItems.join(
          ", "
        )}이고, 컨셉을 즐길만한 곳으로도 관광지를 추천해주세요.\n
        관광지를 표현할 때는 관광지이름과 함께 20자 정도의 간단한 설명을 써주세요.\n
        음식점으로는 ${getResponse.foodItems.join(
          ", "
        )} 식당 위주로 하나씩 들어가야 해요.\n
        그리고 만약 ${
          getResponse.pet
        }이 true일 경우에만 반려동물이 동반 가능한 식당으로 소개해주세요.\n
        어떤 음식점들을 추천해주실 수 있을까요?\n
        식사를 표현할 때는 식당이름과 함께 식당종류를 써주세요. ex)식당 이름 (식당종류) \n
        그리고 아침 식사는 모든 날짜의 일정에 꼭 포함해주세요.\n
        맛집들은 구글 평점 4.0 이상의 맛집들로 추천해줬으면 좋겠어요.\n
        아래 형식으로 데이터를 주고, 더 이상의 말은 덧붙이지 마세요.\n
        yyyy/mm/dd\n아침 식사:\n관광지:\n점심 식사:\n관광지:\n저녁 식사:`;

    api
      .post(`/api/bot/chat`, null, {
        params: {
          prompt: promptMessage,
        },
      })
      .then((postRes) => {
        setPostResponse(postRes.data);
        setDates(postRes.data.dates);
        setInfos(postRes.data.infos);
        localStorage.setItem("postData", JSON.stringify(postRes.data));
      })
      .catch((error) => {
        console.error("Error askData>> ", error.message);
        window.alert("오류가 발생했습니다. 다시 시도해주세요.");
      });
  };

  //내용 수정 시 반영하는 함수
  const contentChanged = (e, index) => {
    const newInfos = [...infos];
    newInfos[index] = e.currentTarget.innerHTML;
    setInfos(newInfos);
    localStorage.setItem("infos", JSON.stringify(newInfos));
  };

  // localStorage에 저장되어 있는지 확인 후 다른 동작 수행
  useEffect(() => {
    const postData = localStorage.getItem("postData");
    const storedInfos = localStorage.getItem("infos");
    if (storedInfos) {
      setInfos(JSON.parse(storedInfos));
    }
    if (postData) {
      setPostResponse(JSON.parse(postData));
    } else {
      if (getResponse !== null) {
        askData();
      }
    }
  }, [getResponse]);

  // 다른 페이지로 이동할 때 localStorage에서 데이터 삭제
  useEffect(() => {
    return () => {
      localStorage.removeItem("conditionDto");
      localStorage.removeItem("postData");
      localStorage.removeItem("infos");
    };
  }, []);

  //저장하기 Button Handler
  const save = () => {
    if (dates !== [] && infos !== []) {
      const data = {
        destination: getResponse.destination,
        startDate: getResponse.startDate,
        endDate: getResponse.endDate,
        partyItems: getResponse.partyItems.join(", "),
        placeItems: getResponse.placeItems.join(", "),
        conceptItems: getResponse.conceptItems.join(", "),
        foodItems: getResponse.foodItems.join(", "),
        resultDto: {
          dates: Array.from(dates),
          infos: Array.from(infos),
        },
      };
      api
        .post(`/api/travelpath/create`, data, {
          withCredentials: true,
        })
        .then((response) => {
          const redirectUrl = response.data;
          navigate(redirectUrl);
        })
        .catch((error) => {
          window.alert("오류가 발생했습니다. 다시 시도해주세요.");
        });
    }
  };

  return (
    <div>
      <div>
        <Top text="추천 여행 일정표" />
      </div>
      <div className={styles.commentArea}>
        <span className={styles.comment}>
          {" "}
          로더가 추천해준 여행일정을 확인해보세요!{" "}
        </span>
        {postResponse == null ? null : (
          <button className={styles.saveBtn} onClick={save}>
            저장
          </button>
        )}
      </div>
      {getResponse == null ? (
        <div className={styles.conditionArea}>
          <div className={styles.loadingBox}>
            <img
              className={styles.loadingImg}
              src={`/images/common/loading.gif`}
              alt="loading"
            />
          </div>
        </div>
      ) : (
        <div className={styles.conditionArea}>
          <div>
            <Conditions
              text={`#${getResponse.startDate} - ${getResponse.endDate}`}
            />
          </div>
          <Conditions text={`#${getResponse.destination}`} />
          <Conditions text={`#${getResponse.partyItems.join(", ")}`} />
          <Conditions text={`#${getResponse.placeItems.join(", ")}`} />
          <Conditions text={`#${getResponse.conceptItems.join(", ")}`} />
          <Conditions text={`#${getResponse.foodItems.join(", ")}`} />
        </div>
      )}
      {postResponse == null ? (
        <div className={styles.loadingBox}>
          <img
            className={styles.loadingImg}
            src={`/images/common/loading.gif`}
            alt="loading"
          />
        </div>
      ) : (
        <div className={styles.resultArea}>
          {postResponse.dates.map((date, index) => (
            <div key={index} className={styles.listBox}>
              <div className={styles.date}>
                <img
                  src={`/images/travelPath/calendar_deepGreen.png`}
                  alt="날짜: "
                  className={styles.calendar}
                />
                <span className={styles.highlight}>{date}</span>
              </div>
              <div className={styles.divider}>
                ------------------------------------------
              </div>
              <div
                className={styles.content}
                contentEditable="true"
                suppressContentEditableWarning={true}
                onInput={(e) => contentChanged(e, index)}
              >
                {postResponse.infos[index].split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <UnderBar />
      </div>
    </div>
  );
}
export default Result;
