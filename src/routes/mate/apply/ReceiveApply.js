import { useEffect, useState } from "react";
import Top from "../../../components/common/Top";
import Apply from "../../../components/mate/apply/Apply";
import UnderBar from "../../../components/common/UnderBar";
import styles from "./ApplyList.module.css";
import axios from "axios";
import api from "../../../api";

function ReceiveApply() {
  const [receivedApplyList, setReceivedApplyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //삭제버튼 클릭 시, 해당 apply 삭제 후, applyList에서도 제거
  const onDelete = (applyId) => {
    setReceivedApplyList((prevApplyList) =>
      prevApplyList.filter((apply) => apply.applyId !== applyId)
    );
  };

  //받은 신청 목록 조회
  const getReceiveApplyList = () => {
    api
      .get(`/api/apply/receive`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setReceivedApplyList(response.data);
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
          console.error("Error getReceiveApplyList>> ", error.message);
          alert("서버 오류가 발생했습니다. 다시 접속해주세요.");
        }
      });
  };

  useEffect(() => {
    getReceiveApplyList();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="받은 메이트신청" />
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
        ) : receivedApplyList.length === 0 ? (
          <div className={styles.alertBox}>
            <img
              src="/images/common/alert.png"
              alt="알림"
              className={styles.alertImg}
            />
            <p />
            <span className={styles.alertMessage}>받은 신청이 없습니다.</span>
          </div>
        ) : (
          receivedApplyList.map((apply) => (
            <Apply
              key={apply.applyId}
              apply={apply}
              applyTmp="receive"
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar
          left="보낸 신청"
          leftLink="/eatMate/sendApply"
          right="전체보기"
          rightLink="/eatMate"
        />
      </div>
    </div>
  );
}

export default ReceiveApply;
