import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const Chat = () => {
  const { chatRoomId: urlChatRoomId } = useParams();
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groupedMessages, setGroupedMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(urlChatRoomId);
  const [stompClient, setStompClient] = useState(null);
  const [selectedTab, setSelectedTab] = useState("private"); // "private" 또는 "collab"
  const token = localStorage.getItem("jwtToken");
  const [collabChatList, setCollabChatList] = useState([]);
  const [avatarUrls, setAvatarUrls] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  // 🔹 이전 채팅방 ID를 저장하는 상태 추가
  const [previousChatRoomId, setPreviousChatRoomId] = useState(null);

  const navigate = useNavigate();

  const connectWebSocket = async (SelectedchatRoomId) => {
    console.log(
      `🔄 채팅방 변경 감지: ${SelectedchatRoomId} -> WebSocket 재연결`
    );

    if (stompClient) {
      console.log(`🔴 기존 WebSocket 구독 해제: sub-${previousChatRoomId}`);

      await new Promise((resolve) => {
        stompClient.deactivate();
        setTimeout(() => {
          console.log("✅ 기존 WebSocket 종료 완료");
          resolve();
        }, 1000); // ✅ WebSocket이 완전히 종료될 때까지 기다림
      });
    }
    initializeWebSocket(SelectedchatRoomId);
  };
  // 🔹 새로운 WebSocket을 설정하는 함수
  const initializeWebSocket = (chatRoomId) => {
    console.log(`🔄 새로운 WebSocket 연결 시작: ${chatRoomId}`);
    const sessionId = encodeURIComponent(localStorage.getItem("sessionId"));

    const socket = new SockJS(
      `https://api.partnerd.site/chat?sessionId=${sessionId}`
    );

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (msg) => console.log("🐞 STOMP DEBUG:", msg),
      reconnectDelay: 1000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공");
        setTimeout(() => {
          if (client.connected) {
            console.log(
              `📡 WebSocket 연결 확인됨, 채팅방 ${chatRoomId} 구독 시작`
            );
            subscribeToChat(chatRoomId, client);
          } else {
            console.warn("⚠️ WebSocket 연결이 아직 완료되지 않음!");
          }
        }, 500);
      },
      onDisconnect: () => {
        console.log("❌ WebSocket 연결 종료");
        setTimeout(() => initializeWebSocket(chatRoomId), 3000);
      },
    });

    client.activate();
    setStompClient(client);
  };
  // 🔹 기존 채팅방을 해제한 후 새로운 채팅방을 구독하는 함수
  const subscribeToChat = (chatRoomId, client) => {
    if (!client || !client.connected) {
      console.error(
        `❌ STOMP 클라이언트가 아직 연결되지 않음! [채팅방 ${chatRoomId}]`
      );
      return;
    }

    console.log(`🔍 채팅방 ${chatRoomId} 구독 요청 중...`);

    // ✅ 기존 채팅방 구독 해제
    if (previousChatRoomId) {
      console.log(`🚫 이전 채팅방 ${previousChatRoomId} 구독 해제 중...`);
      client.unsubscribe(`sub-${previousChatRoomId}`);
      console.log(`✅ 이전 채팅방 ${previousChatRoomId} 구독 해제 완료`);
    }

    setTimeout(() => {
      client.subscribe(
        `/subscribe/chat/${chatRoomId}`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("📩 실시간 메시지 수신:", receivedMessage);

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, receivedMessage];

            // ✅ 날짜별 그룹화하여 UI 업데이트
            setGroupedMessages((prev) => ({
              ...prev,
              [chatRoomId]: groupMessagesByDate(updatedMessages),
            }));

            return updatedMessages;
          });
        },
        { id: `sub-${chatRoomId}` }
      );

      console.log(`✅ 채팅방 ${chatRoomId} 구독 완료`);
      setIsSubscribed(true);
    }, 300);
  };

  const handleChatClick = async (newChatRoomId, newChat) => {
    console.log(`🔄 새로운 채팅방 선택: ${newChatRoomId}`);

    // ✅ 이미 같은 채팅방이면 다시 연결할 필요 없음
    if (selectedChatRoomId === newChatRoomId) {
      console.log(
        "⚠️ 이미 같은 채팅방에 연결되어 있음. WebSocket 재연결 불필요."
      );
      return;
    }

    // ✅ 이전 채팅방 ID 저장
    setPreviousChatRoomId(selectedChatRoomId);
    setSelectedChatRoomId(newChatRoomId);
    setSelectedChat(newChat);
    navigate(`/chat/${newChatRoomId}`);
  };

  // ✅ WebSocket 연결 감지 및 초기화 (중복 연결 방지)
  useEffect(() => {
    if (!selectedChatRoomId) return;

    console.log(`🔄 WebSocket 감지: 채팅방 ${selectedChatRoomId}`);

    const establishConnection = async () => {
      // ✅ 기존 WebSocket이 활성화된 경우 종료 후 재연결
      if (stompClient && stompClient.connected) {
        console.log(
          `🔴 기존 WebSocket 종료 요청: 채팅방 ${previousChatRoomId}`
        );

        await new Promise((resolve) => {
          stompClient.deactivate();
          stompClient.onDisconnect = () => {
            console.log("✅ 기존 WebSocket 완전히 종료됨");
            resolve();
          };
        });
      }

      // ✅ 새로운 WebSocket 연결 시작
      initializeWebSocket(selectedChatRoomId);
    };

    // ✅ 500ms 딜레이 후 WebSocket 연결 (중복 방지)
    const timeoutId = setTimeout(() => {
      establishConnection();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedChatRoomId]);

  // ✅ 채팅방 목록 불러오기 (개인 채팅 & 콜라보 채팅)
  useEffect(() => {
    fetchChats(selectedTab);
  }, [selectedTab]);

  // ✅ 채팅방 목록 불러오기
  const fetchChats = async (tab) => {
    try {
      const url =
        tab === "private"
          ? "https://api.partnerd.site/api/chatRooms/private"
          : "https://api.partnerd.site/api/chatRooms/collab";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`${tab} 채팅방 목록:`, response.data.result);

      if (tab === "private") {
        setChatList(response.data.result.privateChatRooms || []);
      } else {
        setCollabChatList(response.data.result.collabChatRooms || []);
      }
    } catch (error) {
      console.error(`${tab} 채팅방 불러오기 실패`, error);
    }
  };

  // ✅ 특정 채팅방 메시지 불러오기 (기존 메시지 유지)
  useEffect(() => {
    if (!selectedChatRoomId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `https://api.partnerd.site/api/chat/${selectedChatRoomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📩 채팅 메시지 로드:", response.data.result);

        const fetchedMessages = response.data.result || [];

        setMessages(fetchedMessages);

        setGroupedMessages((prev) => ({
          ...prev,
          [selectedChatRoomId]: groupMessagesByDate(fetchedMessages),
        }));
      } catch (error) {
        console.error("메시지 불러오기 실패 ❌", error);
      }
    };
    fetchMessages();
  }, [selectedChatRoomId]);

  // ✅ 메시지 보내기 (WebSocket 발행)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !stompClient || !isSubscribed) {
      console.warn("⚠️ WebSocket 구독 완료 전에는 메시지를 보낼 수 없음!");
      return;
    }

    console.log(selectedChatRoomId);
    let chatRoomId = selectedChatRoomId;
    const newMessage = {
      chatRoomId,
      senderNickname: "율무",
      content: inputMessage,
      sendTime: new Date().toISOString(),
    };

    stompClient.publish({
      destination: `/publish/chat/${selectedChatRoomId}`,
      body: JSON.stringify(newMessage),
    });

    setInputMessage("");
  };

  // ✅ 실시간 메시지를 날짜별로 그룹화하는 함수
  const groupMessagesByDate = (messages = []) => {
    return messages.reduce((acc, message) => {
      const date = message.sendDate || "unknown"; // ✅ 날짜가 없을 경우 대비
      if (!acc[date]) acc[date] = [];
      acc[date].push(message);
      return acc;
    }, {});
  };

  // ✅ Presigned URL 요청 함수
  const fetchPresignedUrl = async (imgKey) => {
    console.log(imgKey);
    if (!imgKey) return "/default-avatar.png"; // 기본 이미지 반환
    try {
      const response = await axios.get(
        `https://api.partnerd.site/api/s3/preSignedUrl`,
        {
          params: {
            keyName: imgKey,
          },
        }
      );
      console.log(response.data.result.cloudFrontUrl);
      return response.data.result.cloudFrontUrl;
    } catch (error) {
      console.error("Presigned URL 요청 실패 ❌", error);
      return "/default-avatar.png"; // 요청 실패 시 기본 이미지 사용
    }
  };
  // ✅ 채팅 리스트 업데이트 시 아바타 이미지 URL 요청
  useEffect(() => {
    const fetchAvatars = async () => {
      console.log(`🔄 Avatar 업데이트 실행 - 현재 탭: ${selectedTab}`);

      const updatedUrls = {};
      const chatListToUse =
        selectedTab === "private" ? chatList : collabChatList;

      if (!chatListToUse || chatListToUse.length === 0) {
        console.log("⚠️ 채팅 목록이 비어 있음, 아바타 업데이트 중단");
        return;
      }
      // 기존 avatarUrls를 초기화하고 새로운 요청 실행
      setAvatarUrls({});
      const promises = chatListToUse.map(async (chat) => {
        const imgKey =
          selectedTab === "private"
            ? chat.receiverProfileImgKeyname
            : chat.clubProfileImgKeyname;
        if (!imgKey) return;

        // 기존 URL이 존재하는 경우 요청하지 않음 (캐싱 적용)
        if (!avatarUrls[chat.chatRoomId]) {
          const url = await fetchPresignedUrl(imgKey);
          updatedUrls[chat.chatRoomId] = url;
        }
      });
      await Promise.all(promises); // 병렬 처리

      console.log("✅ Avatar URL 업데이트 완료:", updatedUrls);
      setAvatarUrls((prev) => ({ ...prev, ...updatedUrls }));
    };

    fetchAvatars();
  }, [selectedTab, chatList, collabChatList]); // ✅ 탭 변경 시마다 업데이트

  return (
    <Container>
      <Sidebar>
        <TabMenu>
          <Tab
            active={selectedTab === "private"}
            onClick={() => setSelectedTab("private")}
          >
            개인 채팅
          </Tab>
          <Tab
            active={selectedTab === "collab"}
            onClick={() => setSelectedTab("collab")}
          >
            콜라보 채팅
          </Tab>
        </TabMenu>
        <ChatList>
          {(selectedTab === "private" ? chatList : collabChatList).map(
            (chat) => (
              <ChatItem
                key={chat.id}
                onClick={() => handleChatClick(chat.chatRoomId, chat)}
              >
                <Avatar
                  src={avatarUrls[chat.chatRoomId] || "/default-avatar.png"}
                />
                <ChatInfo>
                  <ChatName>
                    {selectedTab === "private"
                      ? chat.receiverNickname
                      : chat.clubName}
                  </ChatName>
                  <LastMessage>
                    {chat.lastMessage || "메시지가 없습니다"}
                  </LastMessage>
                </ChatInfo>
                <ChatTime>{chat.time}</ChatTime>
              </ChatItem>
            )
          )}
        </ChatList>
      </Sidebar>

      <ChatContainer>
        {selectedChatRoomId ? (
          <>
            <ChatHeader>{selectedChat.receiverNickname}</ChatHeader>
            <MessageContainer>
              {Object.entries(groupedMessages[selectedChatRoomId] || {}).map(
                ([date, messages]) => (
                  <div key={date}>
                    <DateHeader>{date}</DateHeader>
                    {Array.isArray(messages) &&
                      messages.map((msg, index) => {
                        const isMine = msg.senderNickname === "율무";
                        return (
                          <Message key={index} isMine={isMine}>
                            <MessageWrapper isMine={isMine}>
                              {!isMine && (
                                <Avatar
                                  src={
                                    avatarUrls[msg.id] || "/default-avatar.png"
                                  }
                                />
                              )}
                              <MessageBubble isMine={isMine}>
                                {msg.content}
                              </MessageBubble>
                            </MessageWrapper>
                          </Message>
                        );
                      })}
                  </div>
                )
              )}
            </MessageContainer>
            <MessageInput>
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="메시지를 입력하세요"
              />
              <SendButton onClick={handleSendMessage}>➡</SendButton>
            </MessageInput>
          </>
        ) : (
          <EmptyChat>채팅방을 선택해주세요</EmptyChat>
        )}
      </ChatContainer>
    </Container>
  );
};

export default Chat;
const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  gap: 50px;
  align-items: flex-start; /* 최상단 높이 맞추기 */
  margin: 100px;
  font-family: "Pretendard-Regular";
`;

const ChatTitle = styled.h2`
  text-align: center;
  padding: 10px;
`;

const Sidebar = styled.div`
  width: 350px;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TabMenu = styled.div`
  display: flex;
  padding: 20px;
  margin-bottom: 10px;
`;

const Tab = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  font-size: 24px;
  color: ${({ active }) => (active ? "blue" : "black")};
`;

const ChatList = styled.div`
  padding: 10px;
  height: 85%;
  overflow-y: auto; /* 세로 스크롤 허용 */
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: #f0f2f5;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const ChatContainer = styled.div`
  height: 100%;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-bottom: 20px;
`;
const MessageWrapper = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  height: 100%;
  flex-direction: ${({ isMine }) => (isMine ? "row-reverse" : "row")};
`;

const MessageContainer = styled.div`
  flex-grow: 1; /* ✅ 남은 공간을 자동 확장 */
  overflow-y: auto; /* ✅ 스크롤 가능 */
  width: 600px;
  height: 100%;
  background: white;
  border-radius: 0px;
  box-shadow: 0 2px 20px rgba (0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
`;

const Message = styled.div`
  display: flex;
  justify-content: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
  align-items: center;
  margin: 10px 0;
`;

const MessageBubble = styled.div`
  background: ${({ isMine }) => (isMine ? "#007bff" : "#f1f1f1")};
  color: ${({ isMine }) => (isMine ? "white" : "black")};
  padding: 12px;
  border-radius: 15px;
  max-width: 100%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const DateHeader = styled.div`
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
`;

const EmptyChat = styled.div`
  text-align: center;
  margin-top: 50px;
  color: gray;
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatName = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #333;
`;

const LastMessage = styled.div`
  font-size: 12px;
  color: gray;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const ChatTime = styled.div`
  font-size: 12px;
  color: gray;
  text-align: right;
  min-width: 50px;
`;

const MessageInput = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;

  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 20px;
  border: none;
  border-radius: 25px; /* ✅ 더 부드러운 디자인 */
  outline: none;
  background: white; /* ✅ 메시지 입력란을 구분 */
  box-shadow: inset 0px 2px 5px rgba(0, 0, 0, 0.1);
`;

const SendButton = styled.button`
  padding: 10px;
  margin-left: 10px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  &:hover {
    background-color: #0056b3;
  }
`;
