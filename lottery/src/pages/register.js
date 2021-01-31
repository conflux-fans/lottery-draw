import React, { useState, useEffect } from 'react';
import style from './register.module.less';
import Layout from '../components/Layout';
import Register from '../components/Register';
import Notice from './../components/Notice';
import { ConfluxJSSDK, usePortal } from '../utils/portal';
import { CONTRACT } from './../utils/config';
import { navigate } from 'gatsby';
import Loading from './../components/Loading';

const getMessage = message => {
  if (message.indexOf('you has registered') > -1) {
    return '验证码已注册';
  } else if (message.indexOf('invalid verify code hash') > -1) {
    return '验证码无效';
  }
};

export default () => {
  const { accounts, installed, connected } = usePortal();
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  useEffect(() => {
    if (installed) {
      try {
        setLoadingVisible(true);
        CONTRACT.checkIsRegisterd(accounts[0])
          .then(resp => {
            if (resp) {
              navigate('/success');
            }
          })
          .catch(e => {})
          .finally(() => {
            setLoadingVisible(false);
          });
      } catch (e) {
        console.log('error: ', e);
      }
    }
  }, [connected]);

  const handleSubmit = async ({ keywords, blessings, captcha, name }) => {
    setLoadingVisible(true);
    console.log('register data: ', captcha, keywords, blessings);
    try {
      await CONTRACT.register(
        captcha,
        keywords,
        blessings,
      ).estimateGasAndCollateral();

      await CONTRACT.register(captcha, keywords, blessings)
        .sendTransaction({
          from: accounts[0],
        })
        .executed();

      navigate('/success');
      setLoadingVisible(false);
    } catch (e) {
      console.log('error: ', e);
      if (e.data) {
        const message = ConfluxJSSDK.format.hexBuffer(e.data).toString();
        setNoticeVisible(true);
        setNoticeText(getMessage(message));
      }
      setLoadingVisible(false);
    }
  };

  return (
    <Layout>
      <div className={style.timer}>
        <Register onSubmit={handleSubmit} />
      </div>
      <Notice showNotice={noticeVisible} setShowNotice={setNoticeVisible}>
        {noticeText}
      </Notice>
      <Loading visible={loadingVisible} />
    </Layout>
  );
};
