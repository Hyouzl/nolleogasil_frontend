import { useEffect, useState } from "react";
import styles from "./Apply.module.css";
import Card from "react-bootstrap/Card";
import axios from "axios";
import { formatEatDateTime } from "../Mate_Utils";
import MateInfo from "../MateInfo";
import api from "../../../api";

function Apply({ apply, applyTmp, onDelete }) {
  //applyDto에는 place, mate 객체가 아닌 placeId, mateId로 참조되어 있어서 따로 불러와줘야 함
  const [place, setPlace] = useState({
    placeId: "",
    placeName: "",
    placeAddress: "",
    placeRoadAddress: "",
    placePhone: "",
    placeUrl: "",
    placeLat: "",
    placeLng: "",
    placeCat: "",
  });
  const [mate, setMate] = useState({
    mateId: "",
    usersId: "",
    title: "",
    eatDate: "",
    eatTime: "",
    count: "",
    gender: "",
    comments: "",
    place: place,
  });

  const [deleted, setDeleted] = useState(false);
  const [isApply, setIsApply] = useState(apply.isApply);
  const [timeOver, setTimeOver] = useState(false); //모집기한 마감 상태 -> timeOver되면 true로 변경
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //해당 mate정보 가져오기
  const getMate = () => {
    api
      .get(`/api/mate/${apply.mateId}`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setMate(response.data);
          setPlace(response.data.place);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getMate>> ", error.message);
        }
      });
  };

  //마감기한이 지났는지 확인 후, timeOver 값 변경
  const checkingMateDateTime = () => {
    let now = new Date();
    const mateDate = formatEatDateTime(mate.eatDate, mate.eatTime);

    if (now > mateDate) {
      setTimeOver(true);
    }
  };

  useEffect(() => {
    getMate();
  }, [mate.mateId]);

  useEffect(() => {
    if (mate.title) {
      checkingMateDateTime();
      setLoading(false);
    }
  }, [mate]);

  //apply 삭제 or 신청 취소
  const handleDeleteApply = (applyId, isDelete) => {
    const text = isDelete ? "삭제" : "취소";
    const result = window.confirm(`해당 신청을 정말 ${text}하시겠습니까?`);

    if (result) {
      api
        .delete(`/api/apply/${applyId}`, { withCredentials: true })
        .then((response) => {
          if (response.status === 204) {
            setDeleted(true);
            onDelete(applyId);
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error(
              `Error: ${error.response.status} / ${error.response.statusText}`
            );
            alert("일시적인 오류가 발생했습니다. 다시 시도해주세요.");
          } else {
            console.error(
              `Error handleDeleteApply(${
                isDelete ? "deleteApply" : "cancelApply"
              })>> `,
              error.message
            );
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
          }
        });
    }
  };

  //isApply변경(수락 or 거절)
  const handleUpdateIsApply = (applyId, status) => {
    const result = window.confirm(`해당 신청을 ${status}하시겠습니까?`);
    if (result) {
      api
        .patch(
          `/api/apply/${applyId}?status=${status}`,
          {},
          { withCredentials: true }
        )
        .then((response) => {
          if (response.status === 200) {
            if (status === "수락") {
              window.location.reload();
            } else {
              setIsApply(status);
            }
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error(`Error: ${error.response.status} / ${error.message}`);
            alert("일시적인 오류가 발생했습니다. 다시 시도해주세요.");
          } else {
            console.error("Error handleUpdateIsApply>> ", error.message);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
          }
        });
    }
  };

  //deleted가 true일 때는 빈 요소를 반환해 Apply 카드를 제거
  if (deleted) {
    return null;
  }

  //MateInfo에서 현재 멤버 수 받아오기
  const setMemberCountValue = (count) => {
    setMemberCount(count);
  };

  return loading ? (
    ""
  ) : //---보낸 신청 목록일 경우---
  applyTmp === "send" ? (
    <Card className={styles.sendContainer}>
      <MateInfo
        mate={mate}
        place={place}
        setMemberCountValue={setMemberCountValue}
      />

      {/*마감기한이 지나 timeOver가 됐거나, 인원수가 마감됐다면 마감으로 출력*/}
      {timeOver || mate.count === memberCount ? (
        <div className={styles.waitBtnBox1}>
          <button className={styles.waitBtn} disabled={true}>
            마감
          </button>
        </div>
      ) : //isApply가 대기라면, 신청취소 버튼 출력
      isApply === "대기" ? (
        <div className={styles.waitCancelBtnBox}>
          <button className={styles.waitBtn} disabled={true}>
            대기
          </button>
          <br />
          <button
            className={styles.cancelBtn}
            onClick={() => handleDeleteApply(apply.applyId, false)}
          >
            취소
          </button>
        </div>
      ) : (
        <div className={styles.waitBtnBox1}>
          <button className={styles.waitBtn} disabled={true}>
            {isApply}
          </button>
        </div>
      )}

      {/*isApply가 수락이나 거절이라면, 삭제버튼 활성화*/}
      {/*마감기한이 지나 timeOver가 됐다면, 삭제버튼 활성화*/}
      {isApply !== "대기" || timeOver ? (
        <div className={styles.deleteBtnBox}>
          <img
            src="/images/common/trash_grey.png"
            alt="지우기"
            className={styles.deleteBtn}
            onClick={() => handleDeleteApply(apply.applyId, true)}
          />
        </div>
      ) : (
        ""
      )}
    </Card>
  ) : (
    //---받은 신청 목록일 경우---
    <Card className={styles.receiveContainer}>
      <MateInfo
        mate={mate}
        place={place}
        setMemberCountValue={setMemberCountValue}
        isReceive={true}
        applicantId={apply.applicantId}
      />

      {/*isApply가 대기라면, 수락 거절 버튼을 출력*/}
      {isApply === "대기" ? (
        //마감기한이 지나 timeOver가 됐거나, 인원수가 마감됐다면 버튼 비활성화(마감으로 출력)
        timeOver || mate.count === memberCount ? (
          <div className={styles.waitBtnBox2}>
            <button className={styles.waitBtn} disabled={true}>
              마감
            </button>
          </div>
        ) : (
          <div className={styles.applyBtnBox}>
            <button
              className={styles.applyBtn}
              onClick={() => handleUpdateIsApply(apply.applyId, "수락")}
            >
              수락
            </button>
            <br />
            <button
              className={styles.applyBtn}
              onClick={() => handleUpdateIsApply(apply.applyId, "거절")}
            >
              거절
            </button>
          </div>
        )
      ) : (
        <div className={styles.waitBtnBox2}>
          <button className={styles.waitBtn} disabled={true}>
            {isApply}
          </button>
        </div>
      )}

      {/*isApply가 수락이나 거절이라면, 삭제버튼 활성화*/}
      {/*마감기한이 지나 timeOver가 됐다면, 삭제버튼 활성화*/}
      {isApply !== "대기" || timeOver ? (
        <div className={styles.deleteBtnBox}>
          <img
            src="/images/common/trash_grey.png"
            alt="지우기"
            className={styles.deleteBtn}
            onClick={() => handleDeleteApply(apply.applyId, true)}
          />
        </div>
      ) : (
        ""
      )}
    </Card>
  );
}

export default Apply;
