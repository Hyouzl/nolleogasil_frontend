import React, { useEffect, useState } from "react";

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]); // 알림 데이터를 저장

  useEffect(() => {
    // SSE 연결 생성
    const memberId = 2; // 테스트용 memberId
    const lastEventId = localStorage.getItem("lastEventId") || ""; // 재연결 대비 저장된 Last-Event-ID

    // SSE 연결
    const eventSource = new EventSource(
      `http://localhost:8080/api/notify/subscribe?memberId=${memberId}`,
      {
        headers: {
          "Last-Event-ID": lastEventId, // 이전 이벤트 ID 전달
        },
      }
    );

    eventSource.onopen = () => {
      console.log("SSE Connection Opened");
    };

    // 메시지 수신
    eventSource.onmessage = (event) => {
      console.log("Received Event:", event.data);

      // 알림 업데이트
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        event.data,
      ]);

      // 마지막 이벤트 ID 저장
      if (event.lastEventId) {
        localStorage.setItem("lastEventId", event.lastEventId);
      }
    };

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close(); // 연결 종료
    };

    // 컴포넌트 언마운트 시 SSE 연결 닫기
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationComponent;
