import React, { useState, useEffect } from 'react';
import style from './bye.module.less';
import Layout from '../components/Layout';
import { navigate } from 'gatsby';
import { usePortal } from '../utils/portal';
import classNames from 'classnames';
import Loading from './../components/Loading';
import {
  CONTRACT,
  LOCALSTORAGE_DRAW_TXN_HASH_KEY,
  LOCALSTORAGE_DRAW_PLAN_KEY,
} from './../utils/config';

export default ({ location }) => {
  const { accounts, connected, installed } = usePortal();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (installed && connected) {
      CONTRACT.getAdmin().then(account => {
        setIsAdmin(account === accounts[0]);
      });
    }
  }, [connected, accounts]);

  useEffect(() => {
    localStorage.removeItem(LOCALSTORAGE_DRAW_TXN_HASH_KEY);
    localStorage.removeItem(LOCALSTORAGE_DRAW_PLAN_KEY);
  }, []);

  const handleClick = async function () {
    try {
      setLoading(true);
      await CONTRACT.reset(false, false)
        .sendTransaction({
          from: accounts[0],
          value: 5000e18,
        })
        .executed();
      setLoading(false);
      navigate('/luckydog');
    } catch (e) {
      console.log('error: ', e);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={style.main}>
        <h3 className={style.desc}>抽奖结束，祝大家新年快乐～</h3>
        {/* <button
          className={classNames(style.button, {
            [style.show]: isAdmin,
          })}
          onClick={handleClick}
        >
          reset
        </button> */}
      </div>
      <Loading visible={loading} />
    </Layout>
  );
};
