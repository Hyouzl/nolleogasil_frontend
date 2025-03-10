import React, { useCallback, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Top from "../../components/common/Top";
import styles from "../mate/MateModal.module.css";
import styled from "styled-components";
import TimeButtons from "../../components/mate/TimeButtons";
import Calendar from "react-calendar"; // 이 부분도 올바르게 임포트되었는지 확인
import moment from "moment/moment";
import UnderBar from "../../components/common/UnderBar";
import "react-calendar/dist/Calendar.css";
import MateCalendar from "./MateCalendar";
import api from "../../api";

const accessToken = localStorage.getItem("accessToken");
const usersId = localStorage.getItem("usersId");

function MateModal() {
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url
  const location = useLocation();
  const placeInfo = location.state.place;

  console.log(placeInfo.placeName);
  console.log(usersId);

  const [title, setTitle] = useState("");
  const [gender, setGender] = useState("남성");
  const [comments, setComments] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const amTimeRange = { startHour: 9, endHour: 12 };
  const pmTimeRange = { startHour: 12, endHour: 22 };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [participantCount, setParticipantCount] = useState(1);
  const navigate = useNavigate();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category"); // 'category' 쿼리 파라미터 값 가져오기

  console.log(category);

  const handleIncrement = useCallback(
    (e) => {
      e.preventDefault();
      if (participantCount < 50) {
        setParticipantCount((prevCount) => prevCount + 1);
      }
    },
    [participantCount]
  );

  const handleDecrement = useCallback(
    (e) => {
      e.preventDefault();
      if (participantCount > 1) {
        setParticipantCount((prevCount) => prevCount - 1);
      }
    },
    [participantCount]
  );

  const handleParticipantChange = (e) => {
    const newValue = parseInt(e.target.value);

    if (newValue < 1) {
      alert("최소 참가 인원은 1명입니다.");
      setParticipantCount(1);
    } else if (newValue > 50) {
      alert("최대 참가 인원은 50명입니다.");
      setParticipantCount(50);
    } else {
      setParticipantCount(newValue);
    }
  };

  const handleTimeClick = (selectedTime) => {
    setSelectedTime(selectedTime);
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue); // 선택한 날짜를 상태로 저장
  };

  const handleChangeRadioBtn = (e) => {
    setGender(e.target.value);
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();

    const date = new Date(selectedDate);
    const eatDate = date.toISOString();

    if (
      !title ||
      !selectedTime ||
      !comments ||
      !selectedDate ||
      !participantCount
    ) {
      // 제목, 시간, 코멘트가 입력되지 않은 경우 경고창 표시
      alert("모두 입력하셔야 합니다.");
      return;
    }

    setIsFormSubmitted(true); // 폼이 제출되었음을 상태로 표시

    const formData = new FormData();

    const requestData = {
      title: title,
      eatDate: eatDate, // ISO 문자열로 변환하여 전송
      eatTime: selectedTime,
      gender: gender,
      comments: comments,
      count: participantCount + 1,
    };

    const mateformData = JSON.stringify(requestData);

    formData.append("mateFormDto", requestData);
    formData.append("placeDto", placeInfo);

    api
      .post(
        `/api/mate/mateForm?category=${category}`,
        {
          mateFormDto: requestData,
          placeDto: placeInfo,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json", // JSON 형식으로 요청 보냄을 서버에 알림
          },
        }
      )
      .then((response) => {
        const chatroom = response.data;
        const chatroomId = response.data.chatroomId;

        navigate(`/chat/${chatroomId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <div>
        <Top text="메이트 공고글 작성" />
      </div>

      <MateForm>
        <p className={styles.placeTitle}>
          {" "}
          " <span className={styles.placeName}>{placeInfo.placeName}</span> 에
          함께 갈 메이트를 찾아보세요! "
        </p>
        <span className={styles.questions}>제목을 작성해주세요!</span>
        <Line />
        <Section>
          <TypingTitle>
            <input
              className={styles.titleBox}
              onChange={(e) => setTitle(e.target.value)}
            />
          </TypingTitle>
        </Section>
        <span className={styles.questions}>언제 만나실건가요?</span>
        <Line />
        <Section>
          <div>
            <MateCalendar
              handleChange={handleDateChange}
              selectedDate={selectedDate}
            />
            <StyledBox>
              <StyledDate>
                {moment(selectedDate).format("YYYY년 MM월 DD일")}
              </StyledDate>
            </StyledBox>
          </div>
        </Section>

        <span className={styles.questions}>몇시에 만나실건가요?</span>
        <Line />
        <Section>
          <Questions>오전</Questions>
          <TimeButtons
            name="eatTime"
            timeSection="amTime"
            timeRange={amTimeRange}
            selectedTime={selectedTime}
            onClick={handleTimeClick}
          />
          <Questions>오후</Questions>
          <TimeButtons
            name="eatTime"
            timeSection="pmTime"
            timeRange={pmTimeRange}
            selectedTime={selectedTime}
            onClick={handleTimeClick}
          />
        </Section>
        <span className={styles.questions}>
          몇 명의 메이트와 함께 하실 건가요?
        </span>
        <Line />
        <Section>
          <button className={styles.opBtn} onClick={handleDecrement}>
            -
          </button>
          <input
            type="number"
            className={styles.participantInput}
            value={participantCount}
            onChange={handleParticipantChange}
            min={1}
            max={50}
          />
          <button className={styles.opBtn} onClick={handleIncrement}>
            +
          </button>
        </Section>
        <span className={styles.questions}>선호하는 성별을 선택해주세요.</span>
        <Line />
        <RadioWrap>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="gender"
              value="남성"
              className={styles.radioBtn}
              checked={gender === "남성"}
              onChange={handleChangeRadioBtn}
            />
            <span className={styles.radioValue}>남</span>
          </div>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="gender"
              value="여성"
              className={styles.radioBtn}
              checked={gender === "여성"}
              onChange={handleChangeRadioBtn}
            />
            <span className={styles.radioValue}>여</span>
          </div>
          <div className={styles.radioContainer}>
            <input
              type="radio"
              name="gender"
              value="상관없음"
              className={styles.radioBtn}
              checked={gender === "상관없음"}
              onChange={handleChangeRadioBtn}
            />
            <span className={styles.radioValue}>상관없음</span>
          </div>
        </RadioWrap>

        <span className={styles.questions}>메이트를 찾아보세요!</span>
        <Line />
        <Section>
          <div>
            <div className={styles.commentsCont}>
              <textarea
                className={styles.commentsBox}
                name="comments"
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>
          </div>
        </Section>
        <Section>
          <button
            type="submit"
            className={styles.updateBtn}
            onClick={handleButtonClick}
          >
            메이트 공고글 올리기
          </button>
        </Section>
      </MateForm>
      <div>
        <UnderBar />
      </div>
    </div>
  );
}

export default MateModal;
const StyledDate = styled.div`
  font-size: 16px; /* 폰트 크기 조정 */
  color: rgba(0, 93, 171, 0.8); /* 날짜 텍스트 색상 설정 */
  font-family: "ONE-Mobile-Title";
`;

const StyledBox = styled.div`
  border: 1px solid #87ceeb; /* 박스 테두리 설정 */
  border-radius: 8px; /* 박스 테두리 둥글게 만들기 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  padding: 10px; /* 박스 내부 여백 추가 */
  display: flex;
  width: 500px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledCalendar = styled(Calendar)`
  width: 500px; /* 캘린더의 너비 조정 */
  border: none; /* 캘린더의 기본 테두리 제거 */
  border-radius: 8px; /* 캘린더의 테두리 둥글게 만들기 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  font-size: 16px; /* 폰트 크기 조정 */
  padding: 10px; /* 캘린더 내부 여백 추가 */
  background-color: #eaf7ff; /* 하늘색 배경 색상 적용 */
  font-family: "SUIT-Regular";
`;

const GenderQuestion = styled.label`
  font-size: 17px;
  font-weight: 550;
  color: #484a4b;
  margin-top: 50px;
  padding-left: 20px;
`;

const RadioWrap = styled.div`
  font-size: 17px;
  font-weight: 550;
  color: #484a4b;
  margin-top: 20px;
  margin-bottom: 30px;
  padding-left: 20px;
`;

const MateForm = styled.form`
    height: 81vh;
    padding: 30px 0;
    /* overflow-x: hidden;*/
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;

    .travelForm::-webkit-scrollbar {
        display: none;
`;
const Section = styled.div`
  margin-top: 20px;
  width: 598px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;

  margin-bottom: 20px; /* 각 div 요소에 간격을 주는 부분 */
`;
const TypingTitle = styled.div`
  border: 2px solid #adcdfd;
  border-radius: 20px;
  width: 390px;
  padding: 3px;
  text-align: center;
  margin: 5px auto;
`;

const Questions = styled.span`
  color: rgba(107, 107, 107, 0.82);
  font-size: 18px;
  margin-left: 20px;
  font-weight: bold;
`;
const QuestionsTime = styled.span`
  font-size: 17px;
  font-weight: 550;
  color: #484a4b;
  margin-left: 20px;
  margin-top: 20px;
`;

const Line = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    #87ceeb,
    rgba(0, 131, 171, 0.8),
    #87ceeb
  ); /* 그라디언트 색상 설정 */
  margin: 20px;
`;
