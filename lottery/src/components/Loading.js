/**
 * Loading Component
 */

import React from 'react';
import style from './Loading.module.less';
import classNames from 'classnames';

export default ({ visible }) => {
  return (
    <div
      className={classNames(style.loading, {
        [style.visible]: visible,
      })}
    >
      <div className={style.spinner}>
        <div className={style.rect1}></div>
        <div className={style.rect2}></div>
        <div className={style.rect3}></div>
        <div className={style.rect4}></div>
        <div className={style.rect5}></div>
      </div>
    </div>
  );
};
