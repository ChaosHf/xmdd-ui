'use strict';

var getIe = function() {
  var browser = {
    isIe: function () {
      return navigator.appVersion.indexOf('MSIE') !== -1;
    },
    navigator: navigator.appVersion,
    getVersion: function() {
      var version = 999;
      if (navigator.appVersion.indexOf('MSIE') !== -1) {
        version = parseFloat(navigator.appVersion.split('MSIE')[1]);
      }
      return version;
    }
  };
  if (browser.isIe() && browser.getVersion() <= 9) {
    return true;
  }
  return false;
};

var animateTo = function(that, pos) {
  if(getIe()) {
    that.css({
      'left': pos + 'px'
    }, 500);
  } else {
    that.css({
      'transform': 'translate3d(' + pos + 'px,0,0)',
      '-webkit-transform': 'translate3d(' + pos + 'px,0,0)',
      '-moz-ransform': 'translate3d(' + pos + 'px,0,0)',
      '-o-transform': 'translate3d(' + pos + 'px,0,0)',
      '-ms-transform': 'translate3d(' + pos + 'px,0,0)'
    }, 500);
  }
};

/*var addCssClass = function(className, rules) {
  $('<style type="text/css">.' + className + '{' + rules + '}</style>').appendTo('head');
};*/

var getPosition = function(touchHandler) {
  var touchMoveStatus;
  if(getIe()) {
    touchMoveStatus = touchHandler.position().left;
  } else {
    var style = window.getComputedStyle(touchHandler.get(0));
    var transform = style.transform || style.webkitTransform;
    var matrix = new WebKitCSSMatrix(transform);
    touchMoveStatus = matrix.m41;
  }
  return touchMoveStatus;
};


$.fn.swipeTo = function(options) {


  var settings = $.extend({
    minSwipe: 100,
    angle: 10,
    wrapScroll: 'body',
    binder: true,
    swipeStart: function() {},
    swipeMove: function() {},
    swipeEnd: function() {}
  }, options );

  var start;
  var moving;
  var vertical;
  var verticalMov;
/*  var direction;*/
  var blockRight;
  var res;
  var minSwipe = settings.minSwipe;
  var moveStatus;
  var wrapScroll = $(settings.wrapScroll);
  var angle = settings.angle;
  var handler = this.selector;
  var binder = settings.binder;
  var swipeStart = settings.swipeStart;
  var swipeMove = settings.swipeMove;
  var swipeEnd = settings.swipeEnd;

  /*var onTouchStart = */$(wrapScroll).on('touchstart', handler, function(ev) {
    var that = $(this);
    var e = ev.originalEvent;
    start = e.touches[0].clientX;
    vertical = e.touches[0].clientY;
    moveStatus = getPosition(that);
    start = 0 - moveStatus + start;
    if(typeof swipeStart === 'function') {
      swipeStart.call(this);
    }
  });

  /*var onTouchMove = */$(wrapScroll).on('touchmove', handler, function(ev) {

    var that = $(this);
    that.removeClass('swiped');
    var e = ev.originalEvent;
    // 禁用默认事件和事件传播，修复个别android机型下卡顿问题
    ev.preventDefault();
    ev.stopPropagation();

    moving = e.changedTouches[0].clientX;
    verticalMov = e.changedTouches[0].clientY;
    res = start - moving;
    var horRes = vertical - verticalMov;
    var absRes = Math.abs(res);
    var absHorRes = Math.abs(horRes);
    if(res < 0) {
/*      direction = 'left';*/
      blockRight = false;
    } else if(res > 0) {
/*      direction = 'right';*/
      blockRight = true;
    }

    var resPx = 0 - res;
    if(absRes >= (absHorRes * angle) && blockRight) {
      wrapScroll.addClass('overflow-hidden');
      animateTo(that, resPx);
      if(!that.hasClass('swiping')) {
        that.addClass('swiping');
      }
    }
    if(typeof swipeMove === 'function') {
      swipeMove.call(this);
    }
  });

  /*var onTouchEnd = */$('body').on('touchend', handler, function(ev) {
    var that = $(this);
    var e = ev.originalEvent;
    e.preventDefault();
    wrapScroll.removeClass('overflow-hidden');
    that.removeClass('swiping');
    moveStatus = getPosition(that);

    var absMoveStatus = Math.abs(moveStatus);
    that.addClass('swiped');

    if(absMoveStatus < (typeof minSwipe === 'string' ? that.next(minSwipe).width() : minSwipe)) {
      animateTo(that, 0);
      that.removeClass('open');
    } else {
      animateTo(that, 0 - (typeof minSwipe === 'string' ? that.next(minSwipe).width() : minSwipe));
      that.addClass('open');
    }
    if(typeof swipeEnd === 'function') {
      swipeEnd.call(this);
    }
  });

  if(binder) {
    /*var onTap =*/ $('body').on('click tap', handler, function(ev) {
      if(moveStatus !== 0) {
        var that = $(this);
        var e = ev.originalEvent;
        e.preventDefault();
        that.addClass('swiped');
        animateTo(that, 0);
        that.removeClass('open');
      }

    });
  }
};



