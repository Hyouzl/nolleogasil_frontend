import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import styles from "./MateMember_History.module.css";
import axios from "axios";
import { trimNickName } from "../Mate_Utils";
import api from "../../../api";

function MateMember_History({
  memberId,
  memberUsersId,
  updateMemberMateTempMap,
}) {
  const [member, setMember] = useState({
    nickname: "",
    gender: "",
    mateTemp: 0.0,
  });
  const [newMateTemp, setNewMateTemp] = useState(0.0);
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //해당 멤버의 사용자 정보 불러오기
  const getMemberUsersInfo = () => {
    api
      .get(`/api/user/${memberUsersId}/info`)
      .then((response) => {
        if (response.status === 200) {
          setMember(response.data);
          setNewMateTemp(response.data.mateTemp);
          updateMemberMateTempMap(memberId, response.data.mateTemp);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getMemberUsersInfo>> ", error.message);
        }
      });
  };

  useEffect(() => {
    getMemberUsersInfo();
  }, []);

  const onChangeMateTemp = (input) => {
    setNewMateTemp(parseFloat(input));
    if (input === "") {
      updateMemberMateTempMap(memberId, member.mateTemp);
    } else {
      updateMemberMateTempMap(memberId, parseFloat(input));
    }
  };

  return (
    <Card className={styles.container}>
      <table className={styles.profile}>
        <tbody>
          <tr>
            <td className={styles.nickname}>
              <img
                src="/images/mate/profile2.png"
                alt="프로필"
                className={styles.profileIcon}
              />
              &nbsp;
              {trimNickName(member.nickname)}
              <span className={styles.gender}>({member.gender})</span>
            </td>
            <td className={styles.mateTemp}>
              <img
                src="/images/mate/temperature.png"
                alt="온도"
                className={styles.mateTempIcon}
              />
              <span className={styles.newMateTemp}>
                {newMateTemp.toFixed(1)}ºC
              </span>
            </td>
            <td className={styles.mateTempBarBox}>
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={newMateTemp.toFixed(1)}
                className={styles.mateTempBar}
                onChange={(e) => onChangeMateTemp(e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

export default MateMember_History;
