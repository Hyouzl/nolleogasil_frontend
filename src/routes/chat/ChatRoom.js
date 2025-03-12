import React, { useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ChatRoom.module.css";
import Top from "../../components/common/Top";
import UnderBar from "../../components/common/UnderBar";
import api from "../../api";
import Sidebar from "./Sidebar";

function ChatRoom() {
  const storedUserId = localStorage.getItem("userId");
  const userNickname = localStorage.getItem("nickname");
  // 입력한 채팅값
  const [newMessage, setNewMessage] = useState("");
  //채팅 목록들
  const [messages, setMessages] = useState([]);
  const [groupedMessages, setGroupedMessages] = useState({});
  const client = useRef({});
  let enter = useRef(false);
  const { chatroomId } = useParams();
  const [chatRoom, setChatRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [composition, setComposition] = useState(false); // 입력 완성 여부를 추적하기 위한 상태
  const apiUrl = process.env.REACT_APP_BACKEND_URL; //backend api url
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false); // ✅ 연결 상태 관리
  const accessToken = localStorage.getItem("accessToken");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userScrolled = useRef(false);
  const isWebSocketConnected = useRef(false); // ✅ 중복 연결 방지용 상태 추가

  const backendUrl = "https://api.nolleogasil.shop"; //backend api url
  const testUrl = "http://localhost:8080";
  console.log(chatroomId);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  console.log(isWebSocketConnected.current);
  console.log(client.current.connected);
  const connectWebSocket = async () => {
    if (client.current.connected) {
      console.warn("🚨 이미 WebSocket이 연결되어 있습니다.");
      return;
    }

    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.warn("🚨 WebSocket 연결 전 토큰이 없음. 갱신 시도...");
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        console.error("🚨 토큰 갱신 실패, WebSocket 연결 불가.");
        navigate(`/users/login`);
        return;
      }
    }

    console.log("✅ WebSocket 연결 시도, 토큰:", accessToken);

    const socket = new SockJS(`${backendUrl}/ws?token=${accessToken}`); // ✅ WebSocket 연결 시 JWT 포함
    client.current = Stomp.over(() => socket); // ✅ WebSocket 팩토리 전달
    // ✅ STOMP 클라이언트가 정의된 후 `subscribe()` 실행
    client.current.connect(
      {},
      (frame) => {
        console.log("✅ STOMP 연결 성공:", frame);
        setIsConnected(true); // ✅ 연결 성공 상태 변경

        if (client.current.connected) {
          // ✅ ✅ ✅ 기존 구독이 있다면 해제

          client.current.subscribe(`/topic/room.${chatroomId}`, (message) => {
            console.log("📩 메시지 수신:", message.body);
            setMessages((prevMessages) => [
              ...prevMessages,
              JSON.parse(message.body),
            ]);
          });
          client.current.heartbeat.outgoing = 20000; // 20초마다 클라이언트에서 서버로 ping
          client.current.heartbeat.incoming = 20000; // 20초마다 서버에서 클라이언트로 pong

          checkMateMember(chatroomId)
            .then((isFirstEnter) => {
              console.log(isFirstEnter);

              if (isFirstEnter) {
                joinRoom();
              }
            })
            .catch((error) => {
              console.error("Error while checking mate member status:", error);
            });
        } else {
          console.error("🚨 STOMP 클라이언트가 초기화되지 않았습니다.");
        }
      },
      async (error) => {
        console.error("🚨 STOMP 연결 실패:", error);
        if (!isWebSocketConnected.current) {
          console.warn(
            "❌ 사용자가 채팅방을 나갔기 때문에 재연결을 하지 않습니다."
          );
          return;
        }
        // 401 Unauthorized 발생 시 토큰 재발급 및 WebSocket 재연결
        if (error.headers && error.headers["message"]?.includes("401")) {
          console.warn("⚠️ JWT 만료 감지, 토큰 재발급 시도...");
          const newToken = await refreshAccessToken();
          if (newToken) {
            console.log("✅ 새 JWT 토큰 갱신 완료, WebSocket 재연결...");
            connectWebSocket(); // 토큰 갱신 후 재연결
          } else {
            console.error("🚨 토큰 갱신 실패, 로그인 필요!");
          }
        } else {
          onError(error);
          setIsConnected(false); // 연결 실패 상태 변경
        }
      }
    );
  };
  const refreshAccessToken = async () => {
    try {
      const userId = localStorage.getItem("userId");
      // ✅ Refresh Token 요청
      const response = await api.post("/api/users/refresh", null, {
        params: { userId: userId }, // ✅ 쿼리스트링으로 userId 전달
        withCredentials: true, // ✅ 쿠키 포함 (Refresh Token 자동 전송)
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken); // ✅ 새 토큰 저장
        return data.accessToken;
      } else {
        console.error("🚨 토큰 갱신 실패:", response.status);
        return null;
      }
    } catch (error) {
      console.error("❌ 토큰 갱신 요청 중 오류 발생:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!isWebSocketConnected.current) {
      isWebSocketConnected.current = true; // ✅ 한 번만 실행되도록 설정
      connectWebSocket();
    }

    return () => {
      disconnected(); // ✅ 언마운트 시 정리
      isWebSocketConnected.current = false;
    };
  }, [chatroomId]); // ✅ chatroomId가 변경될 때만 실행

  const onError = (error) => {
    console.error("WebSocket connection error:", error);

    // ✅ 사용자가 채팅방을 나간 경우 재연결하지 않음
    if (!isWebSocketConnected.current) {
      console.warn(
        "❌ 사용자가 채팅방을 나갔기 때문에 재연결을 하지 않습니다."
      );
      return;
    }

    alert("WebSocket connection error. Please refresh the page to try again.");

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    reconnectTimeout.current = setTimeout(() => {
      connectWebSocket();
    }, 5000); // 5초 후 재연결 시도
  };

  const checkMateMember = () => {
    console.log(enter.current);
    return api
      .get(`/api/mateMember/checkedMember`, {
        params: {
          chatroomId: chatroomId,
        },
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data === "firstEnter") {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.error("Error while fetching mate member status:", error);
        return false;
      });
  };

  const joinRoom = () => {
    if (enter.current) return; // 🚨 이미 실행된 경우 중복 실행 방지
    enter.current = true; // ✅ 첫 실행 이후엔 중복 실행 안 되도록 설정
    const sendDate = new Date().toISOString();
    const messageType = "enter";
    const message = userNickname + "님이 입장하셨습니다.";
    console.log(sendDate);

    const newMsg = {
      chatroomId: chatroomId,
      message: message,
      nickname: userNickname,
      userId: storedUserId,
      messageType: messageType, // 가정: 메시지 타입 설정
      sendDate: sendDate,
    };

    //처음 입장 했을 때만
    client.current?.send(
      `/pub/chat.enter`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      JSON.stringify({
        chatroomId: chatroomId,
        userId: storedUserId,
        nickname: userNickname,
        sendDate: sendDate,
        messageType: messageType,
        message: message,
      })
    );
  };

  const disconnected = () => {
    console.log("❌ WebSocket 연결 해제");
    if (client.current && client.current.connected) {
      // ✅ 기존 구독 해제
      if (client.current.subscriptionId) {
        client.current.unsubscribe(client.current.subscriptionId);
        console.warn(`🚨 구독 해제됨: ${client.current.subscriptionId}`);
      }

      // ✅ 연결 해제 플래그 변경
      isWebSocketConnected.current = false;
      console.log(
        "📢 isWebSocketConnected 값 변경됨: ",
        isWebSocketConnected.current
      );

      // ✅ WebSocket 연결 종료
      client.current.disconnect(() => {
        console.log("✅ WebSocket 연결 해제 완료");
      });
    } else {
      console.warn("⚠️ WebSocket이 이미 해제되어 있습니다.");
    }
  };

  const send = ({ chatroomId }) => {
    console.log("메세지보내는 중...");
    // 유저의 정보 가져오기.
    const offset = 1000 * 60 * 60 * 9;
    const koreaNow = new Date(new Date().getTime() + offset);
    const sendDate = koreaNow.toISOString().split(".")[0];

    const messageType = "talk";

    console.log(sendDate);
    if (!client.current || !client.current.connected) {
      console.warn("⚠️ WebSocket이 닫혀있습니다. 다시 연결을 시도합니다...");
      connectWebSocket();

      //클라이언트가 존재하고 웹소켓에 연결되어있으면..
      setTimeout(() => {
        if (client.current && client.current.connected) {
          client.current?.send(
            "/pub/chat.send",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
            JSON.stringify({
              chatroomId: chatroomId,
              message: newMessage,
              userId: storedUserId,
              messageType: messageType,
              nickname: userNickname,
              sendDate: sendDate,
            })
          );
          setNewMessage("");
        }
      }, 1000);
    } else {
      console.log("chatroomId", chatroomId);
      const newMsg = {
        chatroomId: chatroomId,
        message: newMessage,
        nickname: userNickname,
        userId: storedUserId,
        messageType: messageType, // 가정: 메시지 타입 설정
        sendDate: sendDate,
      };

      console.log("📤 메시지 전송:", newMsg);
      client.current?.send(
        "/pub/chat.send",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
        JSON.stringify(newMsg)
      );
      console.log("📤 메시지 전송 완료:", newMessage);
      setNewMessage("");
    }
  };

  const fetchMessages = (chatroomId) => {
    api
      .get(`/api/chat/messages/${chatroomId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("메시지 목록", response.data);
        setMessages(response.data);
      })
      .catch((error) => console.error("Failed to fetch chat messages.", error));
  };

  const groupingMessageByDate = async (messages) => {
    const messageGroups = {};
    messages.forEach((message) => {
      // ISO 8601 형식의 날짜에서 날짜 부분만 추출 ('2024-01-01')
      console.log(message.sendDate);
      const date = message.sendDate.split("T")[0];
      // 해당 날짜에 대한 메시지 배열이 없으면 초기화
      if (!messageGroups[date]) {
        messageGroups[date] = [];
      }
      // 해당 날짜의 메시지 배열에 현재 메시지 추가
      messageGroups[date].push(message);
    });

    // 각 날짜 그룹의 메시지들을 시간 순으로 정렬
    for (const date in messageGroups) {
      messageGroups[date].sort(
        (a, b) => new Date(a.sendDate) - new Date(b.sendDate)
      );
    }
    return messageGroups;
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.clientHeight <=
        container.scrollTop + 50;
      userScrolled.current = !isNearBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    setTimeout(() => {
      container.scrollTop = container.scrollHeight; // ✅ 항상 맨 아래로 이동
    }, 100); // ✅ DOM 업데이트 후 실행 보장
  }, [messages]); // ✅ 메시지가 변경될 때 실행

  const getChatRoom = (chatroomId) => {
    api
      .get(`/api/chatRoom/${chatroomId}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        setChatRoom(res.data);
        setIsLoading(false); // 로딩 상태 비활성화
        console.log(res.data.usersId);
      })
      .catch((error) => {
        console.error("Failed to fetch chat Room.", error);
        setIsLoading(false); // 에러 발생시 로딩 상태 비활성화
      });
  };

  const handleComposition = (e) => {
    if (e.type === "compositionend") {
      setComposition(false); // 입력 완성
    } else {
      setComposition(true); // 입력 중
    }
  };

  useEffect(() => {
    // 최초 렌더링 시 , 웹소켓에 연결
    // 우리는 사용자가 방에 입장하자마자 연결 시켜주어야 하기 때문에,,
    if (!enter.current) {
      getChatRoom(chatroomId);
      fetchMessages(chatroomId);
    }

    return () => {
      disconnected();
    };
  }, [chatroomId]);

  useEffect(() => {
    console.log(messages);

    const groupMessages = async () => {
      // 메시지 목록을 그룹화
      const updatedGroupedMessages = await groupingMessageByDate(messages);
      // 그룹화된 메시지 상태 업데이트
      setGroupedMessages(updatedGroupedMessages);
    };
    // 비동기 함수 호출
    groupMessages();
  }, [messages]); // 메시지 목록이 변경될 때마다 재실행

  useEffect(() => {}, [groupedMessages]);

  const isCurrentUser = (sender) => {
    //console.log(sender);
    //console.log(storedUserId);
    //console.log(Number(sender) === Number(storedUserId));
    if (Number(sender) === Number(storedUserId)) {
      return true;
    } else return false;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !composition) {
      e.preventDefault(); // 기본 이벤트를 취소
      send({ chatroomId });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };
  const handleGoBack = () => {
    console.log("🚪 채팅방 나가기: WebSocket 연결 해제 실행");

    // ✅ WebSocket 연결 해제 먼저 실행
    disconnected();

    setTimeout(() => {
      navigate(-1);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingBox}>
        <img
          className={styles.loadingImg}
          src="/images/common/loading.gif"
          alt="lodaing"
        />
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div>
        <Top text="채팅방" onGoBack={handleGoBack} />
      </div>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTitle}>
            {chatRoom.eatPlace.placeName}
          </div>
          <img
            alt="menubar"
            className={styles.menubarImg}
            src={"/images/chat/menubar.png"}
            onClick={() => {
              toggleSidebar();
            }}
          />
        </div>

        {/* ✅ 사이드바 추가 */}
        <Sidebar
          isOpen={isSidebarOpen}
          chatRoom={chatRoom}
          closeSidebar={toggleSidebar}
        />

        {/* 생략: 채팅방 제목 등의 렌더링 코드 */}
        <div className={styles.messagesContainer} ref={messagesContainerRef}>
          {/* 날짜별 메시지 렌더링 */}
          {Object.keys(groupedMessages)
            .sort()

            .map((date) => (
              <div key={date}>
                <div
                  style={{
                    backgroundColor: "#abaaaa",
                    textAlign: "center",
                    marginBottom: "10px",
                    fontSize: "1.2em",
                    borderRadius: "8px",
                    opacity: "0.7",
                  }}
                >
                  {date}
                </div>
                {groupedMessages[date].map((message, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        message.messageType === "enter" ||
                        message.messageType === "leave"
                          ? "center"
                          : isCurrentUser(message.userId)
                          ? "flex-end"
                          : "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "90%",

                        alignItems: isCurrentUser(message.userId)
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      {/* 메시지 내용 렌더링 */}
                      {message.messageType !== "enter" &&
                        message.messageType !== "leave" && (
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "5px",
                              color: isCurrentUser(message.userId)
                                ? "#007bff"
                                : "#000",
                            }}
                          >
                            {message.nickname}
                          </div>
                        )}
                      <div
                        key={message.chatId}
                        style={{
                          display: "flex", // 이 컨테이너는 flex 박스로 설정
                          alignItems: "center", // 아이템들을 세로 중앙에 위치
                          marginBottom: "10px",
                        }}
                      >
                        {/* 시간 정보를 담는 컨테이너 */}
                        {isCurrentUser(message.userId) &&
                          message.messageType !== "enter" &&
                          message.messageType !== "leave" && (
                            <div
                              style={{
                                color: "#aaa",
                                fontSize: "0.8em",
                                marginBottom: "-20px",
                                marginRight: "5px",
                                flexShrink: 0, // 이 요소의 크기가 flex 컨테이너 내에서 축소되지 않도록 설정
                              }}
                            >
                              {new Date(message.sendDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        <div
                          style={{
                            backgroundColor:
                              message.messageType === "enter" ||
                              message.messageType === "leave"
                                ? "#abaaaa"
                                : isCurrentUser(message.userId)
                                ? "#cce5ff"
                                : "#f0f0f0",
                            padding: "8px",
                            borderRadius: "8px",
                            position: "relative", // 날짜 텍스트를 메시지 상자 내에 위치시키기 위해 relative 설정
                          }}
                        >
                          {message.message}
                          {/* 메시지 타입이 'enter'나 'leave'가 아니고, 사용자가 현재 사용자일 때 날짜 표시 */}
                        </div>
                        {!isCurrentUser(message.userId) &&
                          message.messageType !== "enter" &&
                          message.messageType !== "leave" && (
                            <div
                              style={{
                                color: "#aaa",
                                fontSize: "0.8em",
                                marginBottom: "-20px",
                                marginLeft: "5px",
                                flexShrink: 0, // 이 요소의 크기가 flex 컨테이너 내에서 축소되지 않도록 설정
                              }}
                            >
                              {new Date(message.sendDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleComposition}
            onCompositionUpdate={handleComposition}
            onCompositionEnd={handleComposition}
            placeholder="메시지 입력..."
            style={{
              flex: "1",
              padding: "10px",
              borderRadius: "5px 0 0 5px",
              border: "1px solid #ccc",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          />
          <button
            onClick={() => send({ chatroomId })}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "0 5px 5px 0",
              border: "none",
              cursor: "pointer",
            }}
          >
            전송
          </button>
        </div>
      </div>
      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default ChatRoom;
