import React from 'react';
import { usePortal } from '../utils/portal';
import style from './ConnectPortalButton.module.less';

export default () => {
  const { login } = usePortal();
  return (
    <div className={style.connect} onClick={login}>
      连接钱包
    </div>
  );
};
