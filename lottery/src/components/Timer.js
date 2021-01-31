import React, { useState, useEffect } from 'react';
import style from './Timer.module.less';

export default ({ onChange }) => {
  const AnnualDate = Date.parse('2021-01-22 16:00:00');
  const myDate = new Date();
  const [time, setTime] = useState({
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });
  useEffect(() => {
    let timer = setInterval(() => {
      const timeDiff =
        AnnualDate >= myDate.getTime() ? AnnualDate - myDate.getTime() : 0;
      const date = {
        day: parseInt(timeDiff / (24 * 60 * 60 * 1000), 10)
          .toString()
          .padStart(2, '0'),
        hour: parseInt(
          (timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
          10,
        )
          .toString()
          .padStart(2, '0'),
        minute: parseInt((timeDiff % (60 * 60 * 1000)) / (60 * 1000), 10)
          .toString()
          .padStart(2, '0'),
        second: parseInt((timeDiff % (60 * 1000)) / 1000, 10)
          .toString()
          .padStart(2, '0'),
      };
      setTime(date);
      onChange(+myDate);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div className={style.main}>
      <div className={style.title}>年会倒计时</div>
      <div className={style.time}>
        <div className={style.numbox}>
          <div className={style.hat}>天</div>
          <div className={style.num}>{time.day}</div>
        </div>
        <div className={style.colon}>:</div>
        <div className={style.numbox}>
          <div className={style.hat}>时</div>
          <div className={style.num}>{time.hour}</div>
        </div>
        <div className={style.colon}>:</div>
        <div className={style.numbox}>
          <div className={style.hat}>分</div>
          <div className={style.num}>{time.minute}</div>
        </div>
        <div className={style.colon}>:</div>
        <div className={style.numbox}>
          <div className={style.hat}>秒</div>
          <div className={style.num}>{time.second}</div>
        </div>
      </div>
    </div>
  );
};
