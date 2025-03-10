import Top from "../../components/common/Top";
import KakaoMap from "../../components/kakao/KakaoMap";
import UnderBar from "../../components/common/UnderBar";
import styles from "./maps.module.css";

function Lodging() {
  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="숙소" tmp="map" />
      </div>

      <div className={styles.subBody}>
        {/*숙소 CategoryCode = AD5*/}
        <KakaoMap category="AD5" />
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default Lodging;
