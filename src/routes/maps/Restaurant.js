import Top from "../../components/common/Top";
import KakaoMap from "../../components/kakao/KakaoMap";
import UnderBar from "../../components/common/UnderBar";
import styles from "./maps.module.css";

function Restaurant() {
  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <Top text="맛집" tmp="map" />
      </div>
      <div className={styles.subBody}>
        {/*음식점 CategoryCode = FD6*/}
        <KakaoMap category="FD6" />
      </div>

      <div className={styles.underBarContainer}>
        <UnderBar />
      </div>
    </div>
  );
}

export default Restaurant;
