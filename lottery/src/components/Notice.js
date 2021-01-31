import React from 'react';
import style from './Notice.module.less';
import wrongCaptcha from '../images/wrongcaptcha.png';
import close from '../images/close.png';

export default ({ showNotice, setShowNotice, children }) => {
  return (
    showNotice && (
      <div className={style.collapse}>
        <div className={style.notice}>
          <div
            className={style.closebox}
            onClick={() => setShowNotice(false)}
            role="button"
            tabIndex={0}
          >
            <img src={close} className={style.close} />
          </div>
          <img src={wrongCaptcha} className={style.wrong} />
          <p className={style.des}>{children}</p>
          <div
            className={style.btn}
            onClick={() => setShowNotice(false)}
            role="button"
            tabIndex={0}
          >
            知道了
          </div>
        </div>
      </div>
    )
  );
};
