import React from 'react';
import style from './Dog.module.less';

export default ({ info }) => {
  return (
    <div className={style.box}>
      <img src={info.image} className={style.pic} />
      <div className={style.infobox}>
        <div className={style.up}>
          <div className={style.name}>{info.name}</div>
          <div className={style.desc}>{info.wishes}</div>
        </div>
        <div className={style.down}>{info.blessing}</div>
      </div>
    </div>
  );
};
