/**
 * Footer Component
 */

import React from 'react';
import footerStyle from './Footer.module.less';

export default () => {
  return (
    <footer className={footerStyle.footer}>
      <div className={footerStyle.thanks}>
        特别鸣谢：产品 - 王淋、吴岩凇 ｜ 设计 - 赵贝贝 ｜ 前端开发 -
        王瑜琪、唐学智、罗列 ｜ 合约开发 - 刘严培、王攀、王大勇
      </div>
      <div className={footerStyle.postscript}>* 顺序不分先后</div>
    </footer>
  );
};
