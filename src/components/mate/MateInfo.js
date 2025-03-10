import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MateInfo.module.css";
import {
  changeCategory,
  formatStrEatDateTime,
  trimComments,
} from "./Mate_Utils";
import axios from "axios";
import api from "../../api";

function MateInfo({
  mate,
  place,
  setMemberCountValue,
  isReceive,
  applicantId,
}) {
  const eatDateTime = formatStrEatDateTime(mate.eatDate, mate.eatTime);
  const category = changeCategory(place.placeCat);
  const [memberCount, setMemberCount] = useState(0);
  const [applicant, setApplicant] = useState({
    nickname: "",
    gender: "",
    mateTemp: "",
  });
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url

  //현재 해당 mate에 참여한 member 수 조회
  const getMemberCount = () => {
    api
      .get(`/api/mateMember/${mate.mateId}/count`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setMemberCount(response.data);
          if (setMemberCountValue) {
            //호출한 component에 인원수 전달
            setMemberCountValue(response.data);
          }
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getMemberCount>> ", error.message);
        }
      });
  };

  //신청자 정보 조회
  const getApplicantInfo = () => {
    api
      .get(`/api/user/${applicantId}/info`, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) {
          setApplicant(response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            `Error: ${error.response.status} / ${error.response.statusText}`
          );
        } else {
          console.error("Error getApplicantInfo>> ", error.message);
        }
      });
  };

  useEffect(() => {
    getMemberCount();
    //받은 신청이라면 신청자 정보 조회
    if (isReceive) {
      getApplicantInfo();
    }
  }, []);

  return (
    <Link to="/eatMate/MateDetail" state={{ mate, place }}>
      <table className={styles.mateTable}>
        <tbody>
          <tr>
            <td>
              <span className={styles.name}>{place.placeName}</span>&nbsp;
              <span className={styles.category}>{category}</span>&nbsp;
              {place.distance ? (
                <span className={styles.distance}>
                  ({place.distance.toFixed(1)}km)
                </span>
              ) : (
                ""
              )}
            </td>
          </tr>
          <tr>
            <td className={styles.mateInfo}>
              <span className={styles.title}>"{mate.title}"&nbsp;</span>
              <span> : {trimComments(mate.comments)}</span>
            </td>
          </tr>
          <tr>
            <td className={styles.mateInfo2}>
              <img
                src="/images/mate/calendar.png"
                alt="날짜, 시간"
                className={styles.calendar}
              />
              &nbsp;
              {eatDateTime}
            </td>
          </tr>
          <tr>
            <td className={styles.mateInfo2}>
              <img
                src="/images/mate/members.png"
                alt="멤버 수"
                className={styles.personIcon}
              />
              &nbsp; ({memberCount} / {mate.count}), &nbsp;&nbsp;
              {mate.gender === "남성" && (
                <img
                  src="/images/mate/male.png"
                  alt="남성"
                  className={styles.genderIcon}
                />
              )}
              {mate.gender === "여성" && (
                <img
                  src="/images/mate/female.png"
                  alt="여성"
                  className={styles.genderIcon}
                />
              )}
              {mate.gender === "상관없음" && (
                <img
                  src="/images/mate/allGender.png"
                  alt="성별 상관없음"
                  className={styles.genderIcon}
                />
              )}
              &nbsp;
              {mate.gender}
            </td>
          </tr>
          {
            //받은 신청이라면, 신청자 정보 출력
            isReceive ? (
              <tr>
                <td className={styles.mateInfo}>
                  <img
                    src="/images/mate/profile1.png"
                    alt="신청자"
                    className={styles.profileIcon}
                  />
                  &nbsp;
                  <span className={styles.applicantInfo}>
                    신청자 : {applicant.nickname}({applicant.gender}),{" "}
                    {applicant.mateTemp}ºC
                  </span>
                </td>
              </tr>
            ) : (
              ""
            )
          }
        </tbody>
      </table>
    </Link>
  );
}

export default MateInfo;
