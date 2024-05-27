import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Test from "./routes/Test";
import Main from "./routes/Main";
import Info from "./routes/Info";

import Restaurant from "./routes/maps/Restaurant";
import Cafe from "./routes/maps/Cafe";
import Lodging from "./routes/maps/Lodging";
import Attraction from "./routes/maps/Attraction";

import Mate_Main from "./routes/mate/Mate_Main";
import SendApply from "./routes/mate/apply/SendApply";
import ReceiveApply from "./routes/mate/apply/ReceiveApply";
import MateModal from "./routes/mate/MateModal";
import MateDetail from "./routes/mate/MateDetail";

import TravelPath_Main from "./routes/travelpath/TravelPath_Main";
import TravelPath_List from "./routes/travelpath/TravelPath_List";
import TravelDetail from "./routes/travelpath/TravelDetail";
import Result from "./routes/travelpath/Result";

import MyChatRoomList_Main from "./routes/chat/MyChatRoomList_Main";
import ChatRoom from "./routes/chat/ChatRoom";

import Login from "./routes/users/Login";
import User from "./components/users/User";
import ProfilePath from "./components/users/ProfilePath";
import Logout from "./routes/users/Logout";
import ModifyUser from "./routes/users/ModifyUser";
import MyPage from "./routes/users/MyPage";
import SessionChecker from "./components/users/SessionChecker";


function App() {
  return(
      <Router>
          <Routes>
              <Route path="/test" element={<Test />} />

              {/*Main화면*/}
              <Route path="/" element={<Main />} />
              <Route path="/nolloegasil/info" element={<Info />} />

              <Route path="/map/restaurant" element={<Restaurant />} />
              <Route path="/map/cafe" element={<Cafe />} />
              <Route path="/map/lodging" element={<Lodging />} />
              <Route path="/map/attraction" element={<Attraction />} />
              <Route path="/eatMate" element={<Mate_Main />} />
              <Route path="/travelPath" element={<SessionChecker><TravelPath_Main /></SessionChecker>} />

              {/*메이트 화면*/}
              <Route path="/eatMate/mateForm" element={<MateModal />} />
              <Route path="/eatMate/sendApply" element={<SessionChecker><SendApply /></SessionChecker>} />
              <Route path="/eatMate/receiveApply" element={<SessionChecker><ReceiveApply /></SessionChecker>} />
              <Route path="/eatMate/mateDetail" element={<MateDetail />} />

              {/*여행경로 화면*/}
              <Route path="/travelPath/result" element={<SessionChecker><Result /></SessionChecker>} />
              <Route path="/travelPathList" element={<SessionChecker><TravelPath_List /></SessionChecker> } />
              <Route path="/travelDetail" element={<SessionChecker><TravelDetail /></SessionChecker>} />

              {/*맛집에 해당하는 챗방 목록.. */}
              <Route path="/chat/chatList" element={<SessionChecker><MyChatRoomList_Main /></SessionChecker>} />
              <Route path="/result" element={<Result />} />
              {/*맛집에 해당하는 챗방 목록.. */}
              <Route path="/chat/:chatroomId" element={<ChatRoom />} />

              {/*사용자 정보 관련 화면*/}
              <Route path="/users/login" element={<Login />} />
              <Route path="/api/user/callback" element={<User />} />
              <Route path="/profilePath" element={<ProfilePath />} />
              <Route path="/users/logout" element={<Logout />}/>
              <Route path="/users/update/:usersId" element={<SessionChecker><ModifyUser /></SessionChecker>}/>
              <Route path="/myPage/:usersId" element={<SessionChecker><MyPage /></SessionChecker>}/>

          </Routes>
      </Router>
  );
}

export default App;
