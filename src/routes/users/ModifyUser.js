/**
 * 이 파일은 회원 정보 수정을 위한 js 파일입니다.
 * @author 장민정
 * @since 2024-01-05
 */
import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import styles from "./ModifyUser.module.css";
import DeleteUser from '../../components/users/DeleteUser';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function ModifyUser(){
    const apiUrl = process.env.REACT_APP_BACKEND_URL;  //backend api url
    const navigate = useNavigate();
    const {usersId} = useParams();
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        nickname: '',
        phone: '',
        gender: '',
        mateTemp: 0.0,
    });
    const {name, email, nickname, phone, gender, mateTemp} = userInfo; //비구조화 할당(usersId 변수를 꺼내 데이터를 조회한 후, 각 input의 value를 지정해 세팅해줌(이전에 DB에 저장되어 있던 값들))
    const onChange = (event) => {
        const {value, name} = event.target; //event.target에서 name과 value만 가져옴 (필드 name 아님)
        setUserInfo({
            ...userInfo,
            [name]: value,
        });
    };

    const getUserInfo = async () => {
        //비로그인 상태면 로그인 페이지로 이동하도록 변경...
        try {
            const response = await axios.get(`${apiUrl}/api/user/info/${usersId}`, { withCredentials: true });

            if (response.data) {
                const userData = response.data;
                setUserInfo(userData);
            } else {
                console.error("getUserInfo: 서버 응답 데이터가 없음");
            }
        }catch (error) {
            console.error("getUserInfo 오류...", error);
        }
    };

    const updateUserInfo = async () => {
        try {
            //기존 닉네임 localStorage에서 삭제
            localStorage.removeItem('nickname');

            await axios.post(`${apiUrl}/api/user/info/${usersId}`, { nickname }, { withCredentials: true });
            //수정한 닉네임 localStorage에 설정
            localStorage.setItem('nickname', nickname);
            alert("회원 정보가 수정되었습니다.");
            navigate("/");
        } catch (error) {
            console.error("Update failed: ", error);
        }
    };

    useEffect(() => {
        getUserInfo();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.headliner}>
                My User Info
            </div>
            <div className={styles.editInfo}>
                <Form.Group>
                    <Form.Control
                        type="text"
                        name="name"
                        value={name}
                        readOnly
                        disabled
                        className={styles.readOnly}
                    />
                </Form.Group>
                <p/>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="email"
                        value={email}
                        readOnly
                        disabled
                        className={styles.readOnly}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="nickname"
                        value={nickname}
                        onChange={onChange}
                        className={styles.edit}
                        readOnly={false}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="phone"
                        value={phone}
                        readOnly
                        disabled
                        className={styles.readOnly}
                    />
                </Form.Group>
                <Form.Group className="mb-3">

                    <Form.Control
                        type="text"
                        name="gender"
                        value={gender}
                        readOnly
                        disabled
                        className={styles.readOnly}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        name="mateTemp"
                        value={`${mateTemp.toFixed(1)} ℃`}
                        readOnly
                        disabled
                        className={styles.readOnly}
                    />
                </Form.Group>
            </div>
            <div className={styles.btnGroup}>
                <Button type="submit" onClick={updateUserInfo} className={styles.submit}>수정</Button>
                <span className={styles.btnSpacer}></span>
                <DeleteUser />
            </div>
        </div>
    );
}
export default ModifyUser;