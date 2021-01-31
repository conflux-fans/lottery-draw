import React, { useEffect, useState } from 'react';
import style from './index.module.less';
import Layout from '../components/Layout';
import Timer from '../components/Timer';
import ConnectPortalButton from '../components/ConnectPortalButton';
import { navigate } from 'gatsby';
import { usePortal } from '../utils/portal';
import { CONTRACT } from '../utils/config';
import Loading from './../components/Loading';
import classnames from 'classnames';

export default () => {
  const { connected, accounts, installed } = usePortal();
  const [isDrawer, setIsDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReigster, setIsReigster] = useState(true);
  const [registerStartTime, setRegisterStartTime] = useState(1);
  const [drawStartTime, setDrawStartTime] = useState(1);
  const [now, setNow] = useState(0);

  const checkPermission = async function () {
    try {
      const player = await CONTRACT.getPlayerByAddress(accounts[0]);
      setIsReigster(!!player.toObject().wishes);
      const isDrawer = await CONTRACT.drawers(accounts[0]);
      setIsDrawer(isDrawer);
    } catch (e) {
      console.log('error: ', e);
    }
  };

  const checkDate = async function () {
    try {
      const registerDate = Number(await CONTRACT.registerStartTime());
      setRegisterStartTime(registerDate);
      const drawDate = Number(await CONTRACT.drawStartTime());
      setDrawStartTime(drawDate);
    } catch (e) {}
  };

  const handleTimerChange = timestamp => {
    setNow((timestamp / 1000).toFixed());
  };

  const handleToDraw = () => {
    navigate('/luckydog');
  };

  const handleToRegister = () => {
    navigate('/register');
  };

  const canDraw = now >= drawStartTime;
  const canRegister = now >= registerStartTime;

  useEffect(() => {
    if (installed && connected === 1 && accounts[0]) {
      setLoading(true);
      checkDate();
      checkPermission();
      setLoading(false);
    }
  }, [accounts, connected, installed]);

  return (
    <Layout showFooter showBg>
      <div className={style.timer}>
        <Timer onChange={handleTimerChange} />
      </div>
      {connected !== 1 ? (
        <div className={style.connect}>
          <ConnectPortalButton />
        </div>
      ) : (
        <div>
          {isDrawer && (
            <div
              className={classnames(style.button, {
                [style.disable]: !canDraw,
              })}
              onClick={canDraw ? handleToDraw : () => {}}
            >
              <div>进入抽奖页面</div>
            </div>
          )}
          {!isReigster && (
            <div
              className={classnames(style.button, {
                [style.disable]: !canRegister,
              })}
              onClick={canRegister ? handleToRegister : () => {}}
            >
              进入注册页面
            </div>
          )}

          <p className={style.tipsContainer}>
            <small className={style.tip}>
              {!canRegister &&
                new Date(registerStartTime * 1000).toLocaleString() +
                  ' 后开放注册'}
            </small>
            <small className={style.tip}>
              {!canDraw &&
                new Date(drawStartTime * 1000).toLocaleString() + ' 后开放抽奖'}
            </small>
          </p>
        </div>
      )}
      <Loading visible={loading} />
    </Layout>
  );
};
