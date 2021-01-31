import BigNumber from 'bignumber.js';

let global = {};
if (typeof window !== 'undefined') {
  global = window;
}

export { global as window };

// Fisher–Yates shuffle
let shuffle = arr => {
  for (let i = 1; i < arr.length; i++) {
    const random = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[random];
    arr[random] = temp;
  }
};

export default (arr, n) => {
  if (n <= arr.length) {
    shuffle(arr);
    let ret = arr.splice(1, n);
    return ret;
  } else {
    console.log('everyone has get their prize!');
  }
};

export const getEllipsStr = (str, frontNum, endNum) => {
  if (str) {
    const length = str.length;
    if (endNum === 0 && length <= frontNum) {
      return str.substring(0, frontNum);
    }
    return (
      str.substring(0, frontNum) +
      '...' +
      str.substring(length - endNum, length)
    );
  }
  return '';
};

/**
 * 格式化字符串
 * @param {string} str
 * @param {string} type 可能取值为：tag - contract name tag, hash, address; 如果 type 为数字，则截取对应数字 + ...，默认值为 12
 */
export const formatString = (str, type) => {
  let result;
  switch (type) {
    case 'tag':
      result = getEllipsStr(str, 14, 0);
      break;
    case 'hash':
      result = getEllipsStr(str, 8, 0);
      break;
    case 'address':
      result = getEllipsStr(str, 6, 4);
      break;
    default:
      let num = 12;
      if (typeof type === 'number') num = type;
      if (str.length > num) {
        result = getEllipsStr(str, num, 0);
      } else {
        result = str;
      }
  }
  return result;
};

// alternative of String.prototype.replaceAll
export const replaceAll = (str, find, replace) => {
  return str.replace(
    new RegExp(find.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), 'g'),
    replace,
  );
};

export const toThousands = (num, delimiter = ',') => {
  if ((typeof num !== 'number' || isNaN(num)) && typeof num !== 'string')
    return '';
  let str = num + '';
  return str.split('.').reduce((acc, cur, index) => {
    if (index) {
      return `${acc}.${cur}`;
    } else {
      return cur.replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, `$1${delimiter}`);
    }
  }, '');
};

/**
 * 格式化字符串，向下取整
 * @param {number|string} num 数字或字符串，应尽量使用字符串格式，数字格式如果长度超过 Number.MAX_SAFE_INTEGER 或 Number.MIN_SAFE_INTEGER 可能会有精度损失
 * @param {object} opt 配置参数
 * @returns {string} 格式化后字符串格式数字
 * @todo: 支持四舍五入，向上取整
 * @todo: 支持整数位小数设置精度
 * @todo: 支持负数格式化
 */
export const formatNumber = (num, opt) => {
  // 无法通过 bignumber.js 格式化的不处理
  let bNum = new BigNumber(num).toFixed();
  if (bNum === 'NaN') {
    return '';
  }
  const option = {
    precision: 3, // 保留小数精度数（注意整数位小数的精度固定为 3，原因是受千分符影响）
    keepDecimal: true, // 是否保留小数位（注意如果整数部分带有小数位，则不保留实际小数位，原因是会显示两个小数点，会误解）
    keepZero: false, // 是否保留小数位的 0（注意此配置优先级高于 precision，会清除 precision 添加的 0）
    delimiter: ',', // 自定义分隔符
    ...opt,
  };
  // 0. 定义返回值
  let int = '';
  let decimal = '';
  let result = '';
  /**
   * 1. 定义单位
   * K - kilo, 10³
   * M - mega, 10⁶
   * G - giga, 10⁹
   * T - tera, 10¹²
   * P - peta, 10¹⁵
   * E - exa, 10¹⁸
   * Z - zetta, 10²¹
   * Y - yotta, 10²⁴
   */
  const UNITS = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  // 2. 拆分出整数和小数，小数默认值为 0
  const [intStr, decimalStr = '0'] = bNum.split('.');
  // 3. 只能处理 27 位数的单位，大于 27 位的字符串从头部截断保留
  // 3.1 获取大于小数点前 27 位的数字 intStrFront
  let intStrFront = intStr.slice(-Infinity, -27);
  // 3.2 获取小数点前 27 位数字 intStrEnd
  let intStrEnd = intStr.slice(-27);
  // 4. intStrEnd 转千分符形式
  const intStrEndAfterToThousands = toThousands(intStrEnd, option.delimiter);
  // 5. intStrEnd 添加单位，此处不对数字有效性做验证，即可能值为 100.000，100.000k 或 000.000Y
  const intStrEndWithUnit = intStrEndAfterToThousands
    .split(option.delimiter)
    .reduce((prev, curr, index, arr) => {
      const len = arr.length;
      // 无单位整数，为了后面方便处理统一格式
      if (len === 1) {
        return `${curr}.000`;
      }
      if (index === 0) {
        return curr;
      } else if (index === 1) {
        return `${prev}.${curr}${UNITS[len - index]}`;
      } else {
        return prev;
      }
    }, '');
  // 6. 格式化整数
  if (intStrFront) {
    // 如果数字长度超过 27 位，则前面的数字用千分符分割
    int = `${toThousands(intStrFront, option.delimiter)}${
      option.delimiter
    }${intStrEndWithUnit}`;
  } else {
    int = intStrEndWithUnit;
  }
  // 7. 格式化小数
  decimal = new BigNumber(`0.${decimalStr}`).toPrecision(option.precision, 1);
  // 8. 拼接整数，小数和单位
  let unit = int.slice(-1);
  let intWithoutUnit = int;
  if (int && UNITS.includes(unit)) {
    // 8.1 整数位包含单位，则不显示实际小数部分
    if (option.keepDecimal) {
      // 保留整数位整数 + 整数位小数
      intWithoutUnit = int.slice(-Infinity, -1);
    } else {
      // 仅保留整数位整数
      intWithoutUnit = intWithoutUnit.split('.')[0];
    }
    result = `${intWithoutUnit}${unit}`;
  } else {
    unit = '';
    // 8.2 整数位为 0 或无单位整数，拼接小数位
    if (option.keepDecimal) {
      result = new BigNumber(int)
        .plus(new BigNumber(decimal))
        .toFixed(option.precision, 1);
    } else {
      result = int.split('.')[0];
    }
    intWithoutUnit = result;
  }
  // 9. 处理小数部分的 0
  if (!option.keepZero) {
    result = `${new BigNumber(
      replaceAll(intWithoutUnit, option.delimiter, ''),
    ).toFormat()}${unit}`;
  }
  return result;
};

/**
 *
 * @param num original number
 * @param isShowFull Whether to show all numbers
 */
export const fromDripToCfx = (num, isShowFull = false) => {
  const bn = new BigNumber(num);
  let result = '0';
  if (!global.isNaN(bn.toNumber()) && bn.toNumber() !== 0) {
    const divideBn = bn.dividedBy(10 ** 18);
    if (isShowFull) {
      result = toThousands(divideBn.toFixed());
    } else {
      result =
        divideBn.toNumber() < 0.001
          ? '< 0.001'
          : formatNumber(divideBn.toNumber());
    }
  }
  return result;
};

export const sleep = timeout =>
  new Promise(resolve => setTimeout(resolve, timeout));
