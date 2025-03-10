import { useState, useEffect } from "react";
import Top from "../../../components/common/Top";
import UnderBar from "../../../components/common/UnderBar";
import styles from "./ApplyList.module.css";
import axios from "axios";
import Apply from "../../../components/mate/apply/Apply";
import api from "../../../api";

function SendApply() {
  const [sendApplyList, setSendApplyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //삭제버튼 클릭 시, 해당 apply 삭제 후, applyList에서도 제거
  const onDelete = (applyId) => {
    setSendApplyList((prevApplyList) =>
      prevApplyList.filter((apply) => apply.applyId !== applyId)
    );
  };

  //보낸 신청 목록 조회
  const getSendApplyList = () => {
    api
      .get(`/api/apply/send`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setSendApplyList(response.data);
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
          console.error("Error getSendApplyList>> ", error.message);
          alert("서버 오류가 발생했습니다. 다시 접속해주세요.");
        }
      });
  };

  useEffect(() => {
    getSendApplyList();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="보낸 메이트신청" />
      </div>

      <div className={styles.subBody}>
        {loading ? (
          <div className={styles.loadingBox}>
            <img
              className={styles.loadingImg}
              src="/images/common/loading.gif"
              alt="lodaing"
            />
          </div>
        ) : sendApplyList.length === 0 ? (
          <div className={styles.alertBox}>
            <img
              src="/images/common/alert.png"
              alt="알림"
              className={styles.alertImg}
            />
            <p />
            <span className={styles.alertMessage}>
              보낸 신청이 없습니다.
              <br />
              맞집메이트에 신청해보세요!
            </span>
          </div>
        ) : (
          sendApplyList.map((apply) => (
            <Apply
              key={apply.applyId}
              apply={apply}
              applyTmp="send"
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar
          left="전체보기"
          leftLink="/eatMate"
          right="받은 신청"
          rightLink="/eatMate/receiveApply"
        />
      </div>
    </div>
  );
}

export default SendApply;
