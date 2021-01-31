import React, { useEffect } from 'react';
import classNames from 'classnames';
import lucky from '../utils/lucky';
import style from './Lottory.module.less';
import bg from '../images/lotteryBg.png';
import personArray from '../utils/data';

export default ({
  onStop = () => {},
  onStart,
  prize,
  stopVisible = false,
  disable = false,
}) => {
  useEffect(() => {
    lucky(personArray);
  }, []);

  return (
    <div className={style.main}>
      <div className={style.open} id="openbox">
        <img src={bg} className={style.bg} />
        <div className={style.collapse}>
          <div className={style.startbox}>
            <h2 className={style.title}>
              {prize.title}
              {prize.level > 2 && `（第 ${prize.round} 轮）`}
            </h2>
            <img className={style.pic} src={prize.pic} />
            <p className={style.desc}>
              {prize.name} + {prize.asset} CFX（共 {prize.num} 名）
            </p>
            {/* hack for jquery click event */}
            <div id="open" style={{ display: 'none' }}></div>
            <div
              className={classNames(style.btn_outer, style.btn_open, {
                [style.disable]: disable,
              })}
              onClick={disable ? () => {} : onStart}
            >
              开始
            </div>
          </div>
        </div>
      </div>
      {/* <div
        className={classNames(style.btn_outer, style.btn_stop, {
          [style.show]: stopVisible,
        })}
        id="stop"
        onClick={stopVisible ? onStop : () => {}}
        role="button"
        tabIndex={0}
      >
        停
      </div> */}
      <div className={style.container} id="animation" />
    </div>
  );
};
