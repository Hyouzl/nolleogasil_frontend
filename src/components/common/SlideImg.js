import styles from "./SlideImg.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from "react-bootstrap/Carousel";

function SlideImg() {
  return (
    // 검은 화살표 스타일 적용 (Bootstrap)
    <div className={styles.train} data-bs-theme="dark">
      <Carousel className={styles.show}>
        {[...Array(8)].map((_, index) => (
          <Carousel.Item key={index}>
            <img
              className={styles.picture}
              src={`/images/main/slideImg/picture${index + 1}.jpg`}
              alt={`picture${index + 1}`}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default SlideImg;
