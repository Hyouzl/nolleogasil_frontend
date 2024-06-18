import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import styles from "./MateDetail.module.css";
import Top from "../../components/common/Top";
import PlaceMap from "../../components/kakao/PlaceMap"
import UnderBar from "../../components/common/UnderBar";
import {formatStrEatDateTime, replaceComments} from "../../components/mate/Mate_Utils";
import axios from "axios";
import MateMember_Detail from "../../components/mate/mateMember/MateMember_Detail";

function MateDetail() {
    //<Link>의 state 속성 값
    const mateInfo = useLocation();
    const { mate, place } = mateInfo.state;

    const [master, setMaster] = useState({
        nickname: "",
        gender: "",
        mateTemp: ""
    });
    const [mateMemberList, setMateMemberList] = useState([]);
    const [memberCount, setMemberCount] = useState(0);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const eatDateTime = formatStrEatDateTime(mate.eatDate, mate.eatTime);
    const comments = replaceComments(mate.comments);
    const apiUrl = process.env.REACT_APP_BACKEND_URL;  //backend api url

    //현재 참여한 멤버 수 구하기(본인 포함)
    const getMemberCount = () => {
        axios.get(`${apiUrl}/api/mateMember/countMateMember?mateId=${mate.mateId}`)
            .then(response => {
                setMemberCount(response.data);
            }).catch(error => {
            console.log("Error countMateMember>>> ", error.stack);
        })
    };

    //게시자 정보 가져오기
    const getMaster = () => {
        axios.get(`${apiUrl}/api/user/getUsersInfo?usersId=${mate.usersId}`)
            .then(response => {
                setMaster(response.data);
            }).catch(error => {
            console.log("Error getMasterInfo>>> ", error.stack);
        })
    };

    //현재 멤버목록 가져오기(본인 포함)
    const getMateMember = () => {
        axios.get(`${apiUrl}/api/mateMember/getMateMemberList?mateId=${mate.mateId}`)
            .then(response => {
                setMateMemberList(response.data);
                setLoading(false);
            }).catch(error => {
            throw error;
        })
    }

    useEffect(() => {
        getMemberCount();
        getMaster();
        getMateMember();
    }, [show]);

    //모달 열고, 닫기
    const memberCountClickHandler = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <div>
            <div className={styles.top}>
                <Top text={place.placeName} />
            </div>

            <div className={styles.subBody}>
                <PlaceMap
                    lat={place.placeLat}
                    lng={place.placeLng}
                />

                {loading ? (
                    <div className={styles.loadingBox}>
                        <img className={styles.loadingImg} src="/images/common/loading.gif" alt="lodaing"/>
                    </div>
                ) : (
                    <table className={styles.infoTable}>
                        <tbody>

                        {/*mate정보 출력*/}
                        <tr>
                            <td colSpan="2" className={styles.subject} style={{height: "30px"}}>
                                <span>"{mate.title}"</span>
                                <span className={styles.showMembers} onClick={memberCountClickHandler}>
                                    <img src="/images/mate/members.png" alt="멤버 수" className={styles.personIcon} />&nbsp;
                                    <span className={styles.info}>({memberCount} / {mate.count})</span>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2" className={styles.info}>
                                <img src="/images/mate/calendar.png" alt="날짜, 시간" className={styles.infoIcon}/>&nbsp;
                                {eatDateTime}
                                &nbsp;&nbsp;

                                {mate.gender === "남성" && <img src="/images/mate/male.png" alt="남성" className={styles.genderIcon} />}
                                {mate.gender === "여성" && <img src="/images/mate/female.png" alt="여성" className={styles.genderIcon} />}
                                {mate.gender === "상관없음" && <img src="/images/mate/allGender.png" alt="성별 상관없음" className={styles.genderIcon} />}&nbsp;
                                {mate.gender === "상관없음" ? (mate.gender) : (mate.gender + " 선호")}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles.commentsBox}><img src="/images/mate/comments.png" alt="코멘트" className={styles.commentsIcon}/></td>
                            <td className={styles.comments}>
                                {/*dangerouslySetInnerHTML={{ __html: comments }}>*/}
                                {mate.comments}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2" className={styles.info}>
                                <img src="/images/mate/profile1.png" alt="코멘트" className={styles.infoIcon}/>&nbsp;
                                게시자 : {master.nickname}({master.gender}),&nbsp;&nbsp;
                                {master.mateTemp}ºC
                            </td>
                        </tr>

                        {/*place정보 출력*/}
                        <tr>
                            <td colSpan="2" className={styles.subject} style={{height: "50px"}}>
                                <span>장소 정보</span>
                            </td>
                        </tr>

                        {place.placeAddress ? (
                            <tr>
                                <td colSpan="2" className={styles.info}>
                                    <img src="/images/map/address.png" alt="주소" className={styles.infoIcon}/>
                                    &nbsp;
                                    {place.placeAddress}&nbsp;
                                    {place.placeRoadAddress === null ? (
                                        ""
                                    ) : (
                                        "(" + place.placeRoadAddress + ")"
                                    )}
                                </td>
                            </tr>
                        ) : ( "" )}

                        {place.placePhone ? (
                            <tr>
                                <td colSpan="2" className={styles.info}>
                                    <img src="/images/map/phone.png" alt="전화번호" className={styles.infoIcon}/>
                                    &nbsp;
                                    {place.placePhone}
                                </td>
                            </tr>
                        ): ( "" )}

                        {place.placeUrl ? (
                            <tr>
                                <td colSpan="2" className={styles.info}>
                                    <img src="/images/map/website.png" alt="웹사이트" className={styles.infoIcon}/>
                                    &nbsp;
                                    <a href={place.placeUrl}>
                                        {place.placeUrl}
                                    </a>
                                </td>
                            </tr>
                        ) : ( "" )}

                        </tbody>
                    </table>
                )}

                <Modal show={show} onHide={handleClose} className={styles.modal}>
                    <Modal.Header closeButton>
                        <Modal.Title className={styles.title}>"{place.placeName}"의 맛집메이트 멤버</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.memberInfo}>
                        {mateMemberList.map((member) =>
                            <MateMember_Detail
                                key={member.usersId}
                                masterUsersId={mate.usersId}
                                memberId={member.matememberId}
                                memberUsersId={member.usersId}
                                handleClose={handleClose}
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className={styles.closeBtn} onClick={handleClose}>확인</button>
                    </Modal.Footer>
                </Modal>
            </div>

            <div>
                <UnderBar />
            </div>
        </div>
    );
}

export default MateDetail;