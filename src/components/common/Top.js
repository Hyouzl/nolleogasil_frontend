import { useNavigate } from "react-router-dom";
import styles from "./Top.module.css";
import PropTypes from "prop-types";

function Top({ text, tmp, onGoBack }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (onGoBack) {
      onGoBack(); // ✅ onGoBack이 있을 때만 실행
    } else {
      if (tmp) {
        window.location.href = "/";
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <div className={styles.top}>
      <table>
        <tbody>
          <tr>
            <td>
              <img
                onClick={goBack}
                className={styles.goBackBtn}
                src="/images/common/goBack.png"
                alt="이전으로"
              />
            </td>
            <td>
              <span className={styles.title}>{text}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

Top.propTypes = {
  text: PropTypes.string.isRequired,
};

export default Top;
