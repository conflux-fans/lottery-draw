import $ from 'jquery';
import { Transform } from './globalTransform';
import { trick, tick } from '../utils/trick';

let $bak = $;
if (typeof window === 'undefined') {
  $bak = {
    fn: {},
  };
}

// 3d.js
// if ($ && $.fn && $.fn.lucky) {
$bak.fn.lucky = function (opt) {
  let opts = {
    row: 7,
    col: 5,
    depth: 6,
    iconW: 30,
    iconH: 30,
    iconRadius: 8,
    data: opt.data,
  };
  let self = $(this);
  let settings = $.extend({}, opts, opt);
  let M = {
    WinHeight: $(this).height(),
    winWidth: $(this).width(),
    isThisTag: false,
    centerX: Math.ceil(settings.row / 2) - 1,
    centerY: Math.ceil(settings.col / 2) - 1,
    timer: null,
    isStop: false,
  };
  let styleFun = function (i, r) {
    const onlyWidth = M.winWidth / settings.row;
    const onlyHeight = M.WinHeight / settings.col;
    const onlyCenterW = (M.winWidth / settings.row - settings.iconW) / 2;
    const onlyCenterH = (M.WinHeight / settings.col - settings.iconH) / 2;
    const thisStyle =
      'position:absolute;width:' +
      settings.iconW +
      'px;height:' +
      settings.iconH +
      'px;border-radius:' +
      settings.iconRadius +
      'px;left:' +
      (i * onlyWidth + onlyCenterW) +
      'px;top :' +
      (r * onlyHeight + onlyCenterH) +
      'px;';
    return thisStyle;
  };
  let createEleFun = function (n) {
    let eleStr = '';
    for (let i = 0; i < settings.row; i += 1) {
      for (let r = 0; r < settings.col; r += 1) {
        if (i === M.centerX && r === M.centerY) {
          if (!M.isThisTag) {
            eleStr +=
              '<img style="' +
              styleFun(i, r) +
              '" class="js_current_dom"></img>';
            M.isThisTag = true;
          }
        } else {
          eleStr +=
            '<img data-depth="' +
            n +
            '" style="' +
            styleFun(i, r) +
            '" class="element"></img>';
        }
      }
    }
    self.append(eleStr);
  };
  let initEleFun = function () {
    for (let i = 0; i < settings.depth; i += 1) {
      createEleFun(i);
    }
  };
  let stepFun = function () {
    let index = 0;
    let elements = $('.element').length;
    for (let i = 0; i < elements; i += 1) {
      let element = $('.element')[i];
      if (settings.data[i]) {
        $(element).attr('src', settings.data[i].image);
      } else {
        if (index >= settings.data.length - 1) {
          index = 0;
        } else {
          index += 1;
        }
        $(element).attr('src', settings.data[index].image);
      }
      let depth = $(element).attr('data-depth');
      Transform(element);
      element.translateZ = -depth * 200;
      setTimeout(function () {
        let random = Math.floor(Math.random() * 3) + 15;
        tick(function () {
          if (!M.isStop) {
            if (element.translateZ >= 200) {
              element.translateZ = -depth * 200;
            } else {
              element.translateZ += random;
            }
          }
        });
      }, 200);
    }
    let thisElement = $('.js_current_dom')[0];
    Transform(thisElement);
    tick(function () {
      if (thisElement.translateZ >= 200) {
        thisElement.translateZ = 0;
      } else {
        thisElement.translateZ += 15;
      }
    });
  };
  let initFun = function () {
    initEleFun();
    stepFun();
  };

  let randomFun = function () {
    M.timer = setInterval(function () {
      let randomNum = Math.floor(Math.random() * settings.data.length);
      $('.js_current_dom').attr('src', settings.data[randomNum].image);
    }, 50);
  };
  M.stop = function () {
    clearInterval(M.timer);
    M.isStop = true;
  };
  M.open = function () {
    randomFun();
    M.isStop = false;
  };
  initFun();
  return M;
};
// }

// lucky.js
export default person => {
  let Obj = {};
  Obj.luckyResult = [];
  Obj.luckyResult_history = [];
  let cancelTrick = () => {};

  Obj.M = $('#animation').lucky({
    row: 5, // 每排显示个数  必须为奇数
    col: 5, // 每列显示个数  必须为奇数
    depth: 5, // 纵深度
    iconW: 28, // 图片的宽
    iconH: 28, // 图片的高
    iconRadius: 8, // 图片的圆角
    data: person, // 数据的地址数组
  });

  // 点击停止效果
  $('#stop').click(function (e) {
    if (e.target.className.indexOf('show') > -1) {
      cancelTrick();
      Obj.M.stop();
      $('#animation').hide();
      $(this).hide();
      $('#openbox').show();
    }
  });

  // 点击开始效果
  $('#open').click(function () {
    cancelTrick = trick();
    $('#openbox').hide();
    $('#animation').show();
    Obj.M.open();
    $('#stop').show();
  });
};
