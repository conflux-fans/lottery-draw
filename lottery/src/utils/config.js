import ABI from './abi.json';
import { confluxJS, installed } from './portal';
import { window } from './index';

import pic0 from '../images/prize/0.png';
import pic1 from '../images/prize/1.png';
import pic2 from '../images/prize/2.png';
import pic3 from '../images/prize/3.png';
import pic4 from '../images/prize/4.png';
import pic5 from '../images/prize/5.png';

const CONTRACT_ADDRESS = '0x81b2bf36caac1601702eec31597df4a0e6930ff5';

const LOCALSTORAGE_DRAW_TXN_HASH_KEY = 'lucky_draw_hash';
const LOCALSTORAGE_DRAW_PLAN_KEY = 'lucky_draw_plan';
const LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY = 'lucky_guys';

const CONTRACT =
  installed &&
  confluxJS.Contract({
    abi: ABI,
    address: CONTRACT_ADDRESS,
  });

window.CONTRACT = CONTRACT;

const PRIZE = {
  5: {
    title: '五等奖',
    pic: pic5,
    name: '小度音响',
    num: 0,
    round: 1,
    asset: 0,
    level: 5,
  },
  4: {
    title: '四等奖',
    pic: pic4,
    name: '极米投影仪',
    num: 0,
    round: 1,
    asset: 0,
    level: 4,
  },
  3: {
    title: '三等奖',
    pic: pic3,
    name: 'AirPods',
    num: 0,
    round: 1,
    asset: 0,
    level: 3,
  },
  2: {
    title: '二等奖',
    pic: pic2,
    name: 'iPad',
    num: 0,
    round: 1,
    asset: 0,
    level: 2,
  },
  1: {
    title: '一等奖',
    pic: pic1,
    name: 'iphone12',
    num: 0,
    round: 1,
    asset: 0,
    level: 1,
  },
  0: {
    title: '特等奖',
    pic: pic0,
    name: 'MacBook Pro',
    num: 0, // 待中奖人数
    round: 1,
    asset: 0, // 待中奖的数字货币数
    level: 0,
  },
};

export {
  ABI,
  CONTRACT_ADDRESS,
  CONTRACT,
  PRIZE,
  LOCALSTORAGE_DRAW_TXN_HASH_KEY,
  LOCALSTORAGE_DRAW_PLAN_KEY,
  LOCALSTORAGE_DRAW_LUCKY_GUYS_KEY,
};
