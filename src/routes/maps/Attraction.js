import Top from "../../components/common/Top";
import KakaoMap from "../../components/kakao/KakaoMap";
import UnderBar from "../../components/common/UnderBar";
import styles from "./maps.module.css";

function Attraction() {
  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="관광지" tmp="map" />
      </div>

      <div className={styles.subBody}>
        {/*관광명소 CategoryCode = AT4*/}
        <KakaoMap category="AT4" />
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default Attraction;
