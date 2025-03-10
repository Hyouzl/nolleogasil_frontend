import { useEffect, useState } from "react";
import styles from "./Mate.module.css";
import Card from "react-bootstrap/Card";

import MateInfo from "./MateInfo";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function Mate({ mate, place }) {
  const [isApply, setIsApply] = useState("신청");
  const [memberCount, setMemberCount] = useState(0);
  const usersId = Number(localStorage.getItem("usersId"));
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //로그인한 사용자의 신청 상태(isApply) 불러오기
  const getApplyStatus = async () => {
    //로그인 세션이 존재할 때만 로그인한 사용자의 신청 상태 조회
    api
      .get(`/api/apply/${mate.mateId}/status`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setIsApply(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error checkApplyStatus>> ", error.message);
        }
      });
  };

  useEffect(() => {
    getApplyStatus();
  }, []);

  //신청 버튼 클릭 시
  const handleInsertApply = async (mateId) => {
    //로그인 세션이 존재할 경우

    if (usersId === mate.usersId) {
      alert("본인이 게시한 맛집메이트 공고 글입니다.");
    } else {
      api
        .post(`/api/apply/${mateId}`, {}, { withCredentials: true })
        .then((response) => {
          if (response.status === 201) {
            setIsApply("대기");
            alert(
              "신청이 완료되었습니다.\n취소를 원한다면, 보낸 신청 목록으로 이동하세요."
            );
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error(`Error: ${error.response.status} / ${error.message}`);
            alert("일시적인 오류가 발생했습니다. 다시 시도해주세요.");
          } else {
            console.error("Error handleInsertApply>> ", error.message);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
          }
        });
    }
  };

  //MateInfo에서 현재 멤버 수 받아오기
  const setMemberCountValue = (count) => {
    setMemberCount(count);
  };

  return (
    <Card className={styles.container}>
      <MateInfo
        mate={mate}
        place={place}
        setMemberCountValue={setMemberCountValue}
      />

      <div className={styles.btnBox}>
        {isApply === "신청" ? (
          //인원 수가 마감됐다면, 마감으로 출력
          mate.count === memberCount ? (
            <button className={styles.waitBtn} disabled={true}>
              마감
            </button>
          ) : (
            <button
              className={styles.applyBtn}
              onClick={() => handleInsertApply(mate.mateId)}
            >
              신청
            </button>
          )
        ) : (
          //수락, 대기, 거절 中 1개 출력
          <button className={styles.waitBtn} disabled={true}>
            {isApply}
          </button>
        )}
      </div>
    </Card>
  );
}

export default Mate;
