/**
 * Base Layout for main pages
 */

import React, { useEffect } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Footer from './Footer';
import layoutStyle from './Layout.module.less';
import { usePortal } from '../utils/portal';

export default ({ children, showFooter = false, showBg = false }) => {
  const { installed, login, chainId } = usePortal();
  useEffect(() => {
    if (!installed) {
      alert('检测到未安装钱包，请安装后使用');
    } else {
      if (ConfluxJSSDK.format.uInt(chainId) !== 1029) {
        alert('检测到网络非 mainnet，请更新钱包网络配置');
      }
      login();
    }
  }, []);
  return (
    <div
      className={classNames(layoutStyle.layout, {
        [layoutStyle.showBg]: showBg,
        [layoutStyle.disabled]: !installed,
      })}
    >
      <Header />
      <div className={layoutStyle.main}>{children}</div>
      {showFooter ? <Footer /> : <div className={layoutStyle.footer_place} />}
    </div>
  );
};
