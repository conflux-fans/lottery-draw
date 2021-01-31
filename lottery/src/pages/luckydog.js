import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import Lottory from '../components/Lottory';
import Luckydog from '../components/Luckydog';
import { usePortal, Big, getTransactionLoop } from '../utils/portal';
import {
  CONTRACT,
  PRIZE,
  LOCALSTORAGE_DRAW_TXN_HASH_KEY,
  LOCALSTORAGE_DRAW_PLAN_KEY,
  LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
} from './../utils/config';
import { fromDripToCfx, window, sleep } from './../utils';
import Loading from './../components/Loading';
import $ from 'jquery';
import nameHashJSON from './../utils/nameHash.json';
import { personMap } from './../utils/data';
import { navigate } from 'gatsby';

window.Big = Big;

// const saveLuckyGuys = (level, guys) => {
//   const previousData = localStorage.getItem(LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY);
//   if (previousData) {
//     const data = JSON.parse(previousData);
//     const previousGuys = data[level];
//     if (previousGuys) {
//       localStorage.setItem(
//         LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
//         JSON.stringify({
//           [level]: previousGuys.concat(guys),
//         }),
//       );
//     } else {
//       localStorage.setItem(
//         LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
//         JSON.stringify({
//           ...data,
//           [level]: guys,
//         }),
//       );
//     }
//   } else {
//     localStorage.setItem(
//       LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
//       JSON.stringify({
//         [level]: guys,
//       }),
//     );
//   }
// };

const clearLocalStorage = () => {
  localStorage.removeItem(LOCALSTORAGE_DRAW_TXN_HASH_KEY);
  localStorage.removeItem(LOCALSTORAGE_DRAW_PLAN_KEY);
  localStorage.removeItem(LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY);
};

export default () => {
  const { installed, accounts, connected } = usePortal();
  const [loading, setLoading] = useState(false);
  const [prize, setPrize] = useState(PRIZE[5]);
  const [luckyGuysInfo, setLuckyGuysInfo] = useState();
  const [isLottory, setIsLottory] = useState(true);
  const totalDrawPlansNumRef = useRef(null);
  const [isDrawer, setIsDrawer] = useState(false);

  const checkPermission = async function () {
    if (installed && connected === 1) {
      try {
        if (accounts.length) {
          const isDrawer = await CONTRACT.drawers(accounts[0]);
          setIsDrawer(isDrawer);
          if (!isDrawer) {
            alert('此账号不能执行抽奖操作');
          }
        }
      } catch (e) {
        console.log('CONTRACT.drawers error: ', e);
      }
    }
  };

  const getTotalDrawPlanNum = async function () {
    if (!totalDrawPlansNumRef.current) {
      try {
        totalDrawPlansNumRef.current = Number(await CONTRACT.getDrawPlanNum());
      } catch (e) {
        console.log('CONTRACT.getDrawPlanNum error: ', e);
      }
    }
  };

  const getDrawPlan = async function () {
    try {
      setLoading(true);

      // make sure get total number
      await getTotalDrawPlanNum();

      // 获取下一轮抽奖的 index
      const nextDrawStep = Number(await CONTRACT.nextDrawStep());
      console.log('nextDrawStep: ', nextDrawStep);

      if (totalDrawPlansNumRef.current === nextDrawStep) {
        const luckyGuys = localStorage.getItem(
          LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
        );
        clearLocalStorage();
        // todo 跳转到所有中奖者页面
        navigate('/bye', {
          state: JSON.parse(luckyGuys),
        });
      } else {
        // 获取下次抽奖信息
        const { level, roundIndex, luckyNum, bonus } = await CONTRACT.drawPlans(
          nextDrawStep,
        );
        const currentDrawPlan = {
          ...PRIZE[Number(level)],
          num: Number(luckyNum),
          asset: fromDripToCfx(bonus),
          round: Number(roundIndex),
        };

        localStorage.setItem(
          LOCALSTORAGE_DRAW_PLAN_KEY,
          JSON.stringify(currentDrawPlan),
        );

        setPrize(currentDrawPlan);
      }

      setLoading(false);
    } catch (e) {
      console.log('CONTRACT.nextDrawStep or CONTRACT.drawPlans error: ', e);
    }
  };

  const getLuckyGuysInfo = async function (hash) {
    try {
      const recipt = await getTransactionLoop(hash, {
        method: 'getTransactionReceipt',
      });
      console.log('draw txn recipt: ', recipt);

      console.log('waiting for txn confirmed');
      // need txn status to be confirmed, make more safety, default is 10s
      // there is a problem here, txn is confirmed and status remain to 0, frontend still need to wait for 10s
      await sleep(10000);
      console.log('txn confirmed');

      const luckyGuys = CONTRACT.abi.decodeLog(recipt.logs[0]).object.drawInfo
        .luckyGuys;
      const guysInfo = await Promise.all(
        luckyGuys.map(l => CONTRACT.players(l)),
      );
      // 验证码的 hash
      const luckyGuysHashs = luckyGuys.map(l => {
        return '0x' + l.toString('hex');
      });
      const luckyGuysInfo = guysInfo.map((l, index) => {
        return {
          image: personMap[nameHashJSON[luckyGuysHashs[index]]].image,
          name: nameHashJSON[luckyGuysHashs[index]],
          account: String(l.account),
          wishes: String(l.wishes),
          blessing: String(l.blessing),
          hasWinned: Boolean(l.hasWinned),
          isWhiteList: Boolean(l.isWhiteList),
        };
      });

      // setPrize(prize => {
      //   saveLuckyGuys(
      //     prize.level,
      //     luckyGuysInfo.map(g => ({
      //       name: g.name,
      //       account: g.account,
      //     })),
      //   );
      //   return prize;
      // });

      return luckyGuysInfo;
    } catch (e) {
      console.log('CONTRACT.players error: ', e);
    }
  };

  const handleStart = async function () {
    try {
      console.log('handle start');
      $('#open').click();

      const hash = await CONTRACT.draw().sendTransaction({
        from: accounts[0],
        gas: 15000000,
        storageLimit: 1000,
      });
      console.log('draw txn hash: ', hash);

      localStorage.setItem(
        LOCALSTORAGE_DRAW_TXN_HASH_KEY,
        JSON.stringify(hash),
      );

      const luckyGuysInfo = await getLuckyGuysInfo(hash);

      setLuckyGuysInfo(luckyGuysInfo);
      setIsLottory(false);

      // make sure clear
      localStorage.removeItem(LOCALSTORAGE_DRAW_TXN_HASH_KEY);
    } catch (e) {
      console.log('CONTRACT.draw error: ', e);
    }
  };

  const handleContinue = function () {
    setIsLottory(true);
    getDrawPlan();
  };

  const initDraw = async function () {
    if (installed) {
      try {
        const previousDrawTxnHash = localStorage.getItem(
          LOCALSTORAGE_DRAW_TXN_HASH_KEY,
        );
        if (previousDrawTxnHash) {
          const previousDrawPlan = localStorage.getItem(
            LOCALSTORAGE_DRAW_PLAN_KEY,
          );
          setPrize(JSON.parse(previousDrawPlan));
          setLoading(true);
          const luckyGuysInfo = await getLuckyGuysInfo(
            JSON.parse(previousDrawTxnHash),
          );
          console.log('luckyGuysInfo: ', luckyGuysInfo);
          setLuckyGuysInfo(luckyGuysInfo);
          setIsLottory(false);
          setLoading(false);
        } else {
          getDrawPlan();
        }
      } catch (e) {
        console.log('getLuckyGuysInfo error:', e);
      }
    }
  };

  useEffect(() => {
    checkPermission();
  }, [accounts, installed, connected]);

  useEffect(() => {
    initDraw();
  }, [installed]);

  return (
    <Layout showBg={!isLottory}>
      {isLottory ? (
        <Lottory onStart={handleStart} prize={prize} disable={!isDrawer} />
      ) : (
        <Luckydog
          onContinue={handleContinue}
          prize={prize}
          luckyGuysInfo={luckyGuysInfo}
        />
      )}
      <Loading visible={loading} />
    </Layout>
  );
};
