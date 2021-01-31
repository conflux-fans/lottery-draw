import React from 'react';
import Dog from './Dog';
import style from './Luckydog.module.less';

export default ({ onContinue, prize, luckyGuysInfo }) => {
  return (
    <div className={style.box}>
      <h3 className={style.title}>
        {prize.title}
        {prize.level > 2 && `（第 ${prize.round} 轮） — 中奖者`}
      </h3>
      <div className={style.doglist}>
        {luckyGuysInfo.map(info => (
          <Dog info={info} key={info.name} />
        ))}
      </div>
      <div className={style.btnwrap}>
        <div className={style.continue} onClick={onContinue}>
          继续抽奖
        </div>
      </div>
    </div>
  );
};
