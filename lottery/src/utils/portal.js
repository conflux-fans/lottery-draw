import { useEffect, useState, useRef } from 'react';
import { useConfluxPortal, Big } from '@cfxjs/react-hooks';
import { useEffectOnce } from 'react-use';
import { window } from './index';

// alias for window
const global = window;

const installed = global?.conflux?.isConfluxPortal || 0;

// polling call getTransactionByHash, stoped when status equal to 0
// const getTransactionByHash = (hash, updateStatus, timeout) => {
//   const t = timeout || 2000;
//   return global?.confluxJS
//     .getTransactionByHash(hash)
//     .then(resp => {
//       updateStatus(resp.status);
//       if (resp && resp.status !== 0) {
//         setTimeout(() => {
//           getTransactionByHash(hash);
//         }, t);
//       }
//     })
//     .catch(() => {
//       setTimeout(() => {
//         getTransactionByHash(hash);
//       }, t);
//     });
// };

export const getTransactionLoop = async function (hash, outOptions) {
  return new Promise((resolve, reject) => {
    const loop = async function () {
      const options = {
        callback: () => {},
        timeout: 2000,
        method: 'getTransactionByHash',
        ...outOptions,
      };
      const t = options.timeout;
      const args = Array.from(arguments);
      global?.confluxJS[options.method](hash)
        .then(resp => {
          try {
            let status = null;
            if (options.method === 'getTransactionByHash') {
              status = resp && resp.status;
            } else if (options.method === 'getTransactionReceipt') {
              status = resp && resp.outcomeStatus;
            }
            options.callback(resp);
            if (status !== 0) {
              setTimeout(() => {
                loop.call({}, ...args);
              }, t);
            } else {
              resolve(resp);
              return resp;
            }
          } catch (e) {
            console.log('error: ', e);
            reject(e);
          }
        })
        .catch(() => {
          try {
            setTimeout(() => {
              loop.call({}, ...args);
            }, t);
          } catch (e) {
            console.log('error: ', e);
            throw e;
          }
        });
    };
    loop();
  });
};

window.getTransactionLoop = getTransactionLoop;

// chain id hook
const useChainId = outerChainId => {
  const [chainId, setChainId] = useState(
    outerChainId || global?.conflux?.chainId,
  );

  useEffectOnce(() => {
    const chainIdHandler = id => {
      setChainId(id);
    };
    global?.conflux?.on('chainChanged', chainIdHandler);
    return () => {
      global?.conflux?.off('chainChanged', chainIdHandler);
    };
  });

  // 解决初始化页面的时候，无法读取 conflux.chainId 问题
  useEffect(() => {
    const globalChainId = global?.conflux?.chainId;
    if (globalChainId !== chainId) {
      setChainId(globalChainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global?.conflux?.chainId]);

  return [chainId, setChainId];
};

// account address hook
const useAccounts = outerAccounts => {
  const [accounts, setAccounts] = useState(
    outerAccounts || global?.conflux?.selectedAddress
      ? [global?.conflux?.selectedAddress]
      : [],
  );
  useEffectOnce(() => {
    const accountsHandler = newAccounts => {
      setAccounts(newAccounts);
    };
    global?.conflux?.on('accountsChanged', accountsHandler);
    return () => {
      global?.conflux?.off('accountsChanged', accountsHandler);
    };
  });

  useEffect(() => {
    const globalAccounts = global?.conflux?.selectedAddress
      ? [global?.conflux?.selectedAddress]
      : [];
    if (globalAccounts[0] !== accounts[0]) {
      setAccounts(globalAccounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global?.conflux?.selectedAddress]);

  return [accounts, setAccounts];
};

// login hook
const useLogin = (outerConnected, outerAccounts) => {
  const [accounts, setAccounts] = useAccounts(outerAccounts);
  // 0 - not connect, 1 - connected, 2 - connecting
  const [connected, setConnected] = useState(
    outerConnected || accounts[0] ? 1 : 0,
  );

  // 登录功能 + 登录状态同步
  const login = () => {
    if (installed && !accounts.length) {
      setConnected(2);
      global?.conflux
        ?.enable()
        ?.then(accounts => {
          setConnected(1);
          // @todo why need to check setAccount type ?
          typeof setAccounts === 'function' && setAccounts(accounts);
        })
        ?.catch(e => {
          setConnected(0);
        });
    }
  };

  useEffect(() => {
    setConnected(accounts[0] ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts[0]]);

  const ensureLogin = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffectOnce(login);
  };

  return { connected, accounts, login, ensureLogin };
};

export const useGetTransactionsStatus = (
  transactionHashs,
  transactionStatusMap,
  timeout, // timeout to polling txn status
  method = 'getTransactionByHash', // getTransactionByHash or getTransactionReceipt
) => {
  // 0 for success, 1 for error occured, null when the transaction is skipped or not packed.
  // ref to: https://developer.conflux-chain.org/docs/js-conflux-sdk/docs/javascript_sdk#Conflux.js/Conflux/getTransactionByHash
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [statusMap, setStatusMap] = useState(transactionStatusMap || {});
  const [hashs, setHashs] = useState(transactionHashs);
  const requestedHashRef = useRef(
    transactionHashs.reduce((prev, curr) => {
      prev[curr] = false;
      return prev;
    }, {}),
  );

  const addHashs = newHashs => {
    // @ts-ignore
    setHashs(hashs => [].concat(newHashs, hashs));
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    hashs
      .filter(h => !requestedHashRef[h])
      .forEach(h => {
        requestedHashRef.current[h] = true;
        getTransactionLoop(h, {
          callback: ({ status }) => {
            setStatusMap(statusMap => ({
              ...statusMap,
              [h]: status,
            }));
          },
          timeout,
          method,
        });
      });
  }, [hashs, timeout]);

  return {
    hashs: hashs.map(h => ({
      hash: h,
      status: statusMap[h] === undefined ? null : statusMap[h],
    })),
    statusMap,
    setHashs,
    addHashs,
  };
};

// @todo 是否应该和 @cfxjs/react-hooks 合并到一起？
export const usePortal = () => {
  // prevent portal auto refresh when user changes the network
  if (global?.conflux?.autoRefreshOnNetworkChange)
    global.conflux.autoRefreshOnNetworkChange = false;

  if (!useConfluxPortal) {
    return {
      installed: 1,
      connected: 0, // 0 - not connect, 1 - connected, 2 - connecting
      accounts: [],
      chainId: 0, // hex value, 0xNaN mean changing network
      // @todo check balances value
      balances: {
        // numeric string, NaN mean no such asset
        cfx: '0',
        fc: '0',
        ceth: '0',
      },
      // 用户调用这个函数尤其需要小心，因为如果未登录，只要调用函数，就会在钱包上请求一次连接，因尽量在 useEffectOnce 中使用
      login: () => {},
      ensureLogin: () => {},
      useGetTransactionsStatus: () => {},
      Big: () => {},
      conflux: global?.conflux,
      confluxJS: global?.confluxJS,
      ConfluxJSSDK: global?.ConfluxJSSDK,
    };
  }

  const {
    balances: [balance, [fc, ceth]],
  } = useConfluxPortal([
    // fc contract address, can be find on confluxscan.io
    '0x8e2f2e68eb75bb8b18caafe9607242d4748f8d98',
    // ceth contract address, can be find on confluxscan.io
    '0x86d2fb177eff4be03a342951269096265b98ac46',
  ]);

  const [chainId] = useChainId();
  const { connected, accounts, login, ensureLogin } = useLogin();

  return {
    installed: Number(installed), // 0 - not install, 1 - installed
    connected, // 0 - not connect, 1 - connected, 2 - connecting
    accounts,
    chainId, // hex value, 0xNaN mean changing network
    // @todo check balances value
    balances: {
      // numeric string, NaN mean no such asset
      cfx: (Big(balance) / 1e18).toString(),
      fc: (Big(fc) / 1e18).toString(),
      ceth: (Big(ceth) / 1e18).toString(),
    },
    // 用户调用这个函数尤其需要小心，因为如果未登录，只要调用函数，就会在钱包上请求一次连接，因尽量在 useEffectOnce 中使用
    login,
    ensureLogin,
    useGetTransactionsStatus,
    Big,
    conflux: global?.conflux,
    confluxJS: global?.confluxJS,
    ConfluxJSSDK: global?.ConfluxJSSDK,
  };
};

export { Big, installed };
export const conflux = global?.conflux;
export const confluxJS = global?.confluxJS;
export const ConfluxJSSDK = global?.ConfluxJSSDK;
