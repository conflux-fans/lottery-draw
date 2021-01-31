/**
 * Header Component
 */

import React from 'react';
import headerStyle from './Header.module.less';
import HeaderButton from './HeaderButton';
import pic from '../images/headerpic.png';
import { Link } from 'gatsby';

export default () => {
  return (
    <header className={headerStyle.header}>
      <Link to="/">
        <img src={pic} className={headerStyle.logo} />
      </Link>
      <HeaderButton />
    </header>
  );
};
