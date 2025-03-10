import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import styles from "./MateHistory.module.css";
import MateInfo from "./MateInfo";
import MateMember_History from "./mateMember/MateMember_History";
import { formatEatDateTime } from "./Mate_Utils";
import api from "../../api";

function MateHistory({ mate, place }) {
  const [loginUsersMemberInfo, setLoginUsersMemberInfo] = useState({
    isGiven: -1,
  });
  const [mateMemberList, setMateMemberList] = useState([]);
  const [memberMateTempMap, setMemberMateTempMap] = useState({}); //멤버별 부여할 온도값 저장
  const [timeOver, setTimeOver] = useState(false); //메이트 기간 마감여부 -> timeOver되면 true로 변경
  const [show, setShow] = useState(false);
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //해당 mate의 member 목록 조회(로그인한 사용자 본인은 제외)
  const getMateMemberList = () => {
    api
      .get(`/api/mateMember/${mate.mateId}/excluding-me`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setMateMemberList(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error(
            "Error getMateMemberList_excluding_me>> ",
            error.message
          );
        }
      });
  };

  //로그인한 사용자의 온도 부여 여부 불러오기(isGiven) -> 0이면 이미 온도를 부여한 것(1번만 부여 가능하도록)
  const getLoginUsersMemberInfo = () => {
    api
      .get(`/api/mateMember/${mate.mateId}/my-info`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setLoginUsersMemberInfo(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getLoginUsersMemberInfo>> ", error.message);
        }
      });
  };

  //메이트 기간이 지났는지 확인
  const checkingMateDateTime = () => {
    let now = new Date();
    const mateDate = formatEatDateTime(mate.eatDate, mate.eatTime);

    if (now > mateDate) {
      setTimeOver(true);
    }
  };

  useEffect(() => {
    getMateMemberList();
    getLoginUsersMemberInfo();
    checkingMateDateTime();
  }, [mate.mateId]);

  const readMoreBtnClickHandler = () => setShow(true); //모달 열기
  const handleClose = () => setShow(false); //모달 닫기

  //온도주기 버튼 클릭 시
  const handleSetMateTemp = (memberMateTempMap) => {
    const result = window.confirm(
      "설정한 값으로 멤버들의 온도를 부여하시겠습니까?"
    );
    if (result) {
      api
        .patch(`/api/mateMember/${mate.mateId}/temp`, memberMateTempMap, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.status === 204) {
            alert("성공적으로 온도를 부여했습니다.");
            setShow(false);
            getLoginUsersMemberInfo(); // isGiven 다시 불러오기
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error(
              `Error: ${error.response.status} / ${error.response.statusText}`
            );
            alert("일시적인 오류가 발생했습니다. 다시 시도해주세요.");
          } else {
            console.error("Error handleSetMateTemp>> ", error.message);
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
          }
        });
    }
  };

  //MateMember_History에서 변경되는 온도 값을 가져와 memberMateTempMap의 값 setting
  const updateMemberMateTempMap = (memberId, newMateTemp) => {
    setMemberMateTempMap((prevMap) => ({
      ...prevMap,
      [memberId]: newMateTemp,
    }));
  };

  return (
    <div>
      <Card className={styles.container}>
        <MateInfo mate={mate} place={place} />

        {/*해당 mate의 날짜 및 시간이 지나면 온도주기 버튼 출력*/}
        {timeOver ? (
          //사용자가 이미 온도를 부여한 상태라면, 온도 주기 완료버튼 출력
          loginUsersMemberInfo.isGiven === 0 ? (
            <div className={styles.btnBox}>
              <button className={styles.completeBtn} disabled={true}>
                온도 주기 완료
              </button>
            </div>
          ) : (
            <div className={styles.btnBox}>
              <button
                className={styles.readMoreBtn}
                onClick={readMoreBtnClickHandler}
              >
                온도 주기
              </button>
            </div>
          )
        ) : (
          ""
        )}
      </Card>

      {/*다른 member들에게 온도주기 모달 창*/}
      <Modal show={show} onHide={handleClose} className={styles.modal}>
        <Modal.Header closeButton>
          <Modal.Title className={styles.title}>
            "{place.placeName}"의 맛집메이트 멤버
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.memberInfo}>
          <span className={styles.text}>
            함께 식사를 했던 맛집메이트 멤버에게 온도를 부여해주세요!
          </span>

          {/*로그인한 사용자를 제외한 맛집메이트 멤버가 없다면, 문구 출력*/}
          {mateMemberList.length === 0 ? (
            <div>
              <hr />
              <span className={styles.text2}>
                함께한 맛집메이트 멤버가 없습니다.
              </span>
            </div>
          ) : (
            mateMemberList.map((member) => (
              <MateMember_History
                key={member.usersId}
                memberId={member.matememberId}
                memberUsersId={member.usersId}
                updateMemberMateTempMap={updateMemberMateTempMap}
              />
            ))
          )}
        </Modal.Body>

        <Modal.Footer>
          {mateMemberList.length === 0 ? (
            <button className={styles.closeBtn} onClick={() => handleClose()}>
              닫기
            </button>
          ) : (
            <button
              className={styles.setMateTempBtn}
              onClick={() => handleSetMateTemp(memberMateTempMap)}
            >
              온도 주기
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MateHistory;
