import Top from "../../components/common/Top";
import KakaoMap from "../../components/kakao/KakaoMap";
import UnderBar from "../../components/common/UnderBar";
import styles from "./maps.module.css";

function Cafe() {
  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="카페" tmp="map" />
      </div>

      <div className={styles.subBody}>
        {/*카페 CategoryCode = CE7*/}
        <KakaoMap category="CE7" />
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default Cafe;
