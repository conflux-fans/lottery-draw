/**
 * Header Component
 */

import React from 'react';
import classNames from 'classnames';
import { usePortal } from '../utils/portal';
import style from './HeaderButton.module.less';
import { formatString } from '../utils/index';

export default () => {
  const { connected, accounts, login } = usePortal();
  const buttonText = {
    0: '连接钱包',
    1: formatString(accounts[0], 'address'),
    2: '正在连接...',
  }[connected];
  return (
    <div
      className={classNames(
        style.connect,
        connected === 1 ? style.active : style.inactive,
      )}
      onClick={login}
    >
      {buttonText}
    </div>
  );
};
