/*jslint
  browser: true
  regexp: true
*/
/*global
  document, window
*/
/*exported
  CustomSlider
*/

function CustomSlider() {
  'use strict';

  /*  Remove all children of target
  */
  function clearChildren(target) {
    while (target.childNodes.length > 0) {
      target.removeChild(target.lastChild);
    }
  }

  /*  error during buildSlider
  */
  function displayAttributeError(target, message) {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('[customslider] ' + message));
    target.appendChild(p);
  }

  /*  return number and unit of src
  */
  function seperateNumberAndUnit(src) {
    var srcMatch, nu;
    // match CSS <length>, <percentage>, or <number>
    srcMatch = src.match(/^([+\-]?(?:(?:[0-9]+)?\.[0-9]+|[0-9]+)(?:e[+\-]?[0-9]+)?)([A-Za-z]+|%)?$/);
    nu = {};
    if (!srcMatch[1]) { // invalid number
      nu.number = NaN;
    } else {
      nu.number = +srcMatch[1];
    }
    if (!srcMatch[2]) { // no unit
      nu.unit = undefined;
    } else {
      nu.unit = srcMatch[2];
    }
    return nu;
  }

  function getAttributesFromTarget(target) {
    var data, temp, nu;

    data = {};

    // data-min -> data.min:Number
    data.min = +target.getAttribute('data-min');
    if (!data.min && data.min !== 0) {
      displayAttributeError(target, 'data-min is undefined');
      return;
    }

    // data-max -> data.max:Number
    data.max = +target.getAttribute('data-max');
    if (!data.max && data.max !== 0) {
      displayAttributeError(target, 'data-max is undefined');
      return;
    }

    // validate data-min and data-max
    // data-min should be less than data-max
    if (data.min >= data.max) {
      displayAttributeError(target, 'data-min (' + data.min + ') and data-max (' + data.max + ') are inappropriate');
      return;
    }

    // data-value -> data.value:Number
    data.value = +target.getAttribute('data-value');
    if (!data.value && data.value !== 0) { // NaN, null, undefined, ''
      data.value = data.min;
    } else if (data.value < data.min) {
      data.value = data.min;
    } else if (data.value > data.max) {
      data.value = data.max;
    }

    // data-width -> data.width:String
    temp = target.getAttribute('data-width');
    if (!temp) {
      data.width = '200px';
    } else {
      nu = seperateNumberAndUnit(temp.trim());
      if (!nu.number && nu.number !== 0) {
        nu.number = 200;
      }
      if (!nu.unit) {
        nu.unit = 'px';
      }
      data.width = nu.number + nu.unit;
    }

    data.track = {};

    // data-track-cap-width -> data.track.capWidth:String
    temp = target.getAttribute('data-track-cap-width');
    if (!temp) {
      data.track.capWidth = '0px';
    } else {
      nu = seperateNumberAndUnit(temp.trim());
      if (!nu.number && nu.number !== 0) {
        nu.number = 0;
      }
      if (!nu.unit) {
        nu.unit = 'px';
      }
      data.track.capWidth = nu.number + nu.unit;
    }

    // data-track-height -> data.track.height:String
    temp = target.getAttribute('data-track-height');
    if (!temp) {
      data.track.height = '0px';
    } else {
      nu = seperateNumberAndUnit(temp.trim());
      if (!nu.number && nu.number !== 0) {
        nu.number = 0;
      }
      if (!nu.unit) {
        nu.unit = 'px';
      }
      data.track.height = nu.number + nu.unit;
    }

    data.thumb = {};

    // data-thumb-width -> data.thumb.width:String
    temp = target.getAttribute('data-thumb-width');
    if (!temp) {
      data.thumb.width = '0px';
    } else {
      nu = seperateNumberAndUnit(temp.trim());
      if (!nu.number && nu.number !== 0) {
        nu.number = 0;
      }
      if (!nu.unit) {
        nu.unit = 'px';
      }
      data.thumb.width = nu.number + nu.unit;
    }

    // data-thumb-height -> data.thumb.height:String
    temp = target.getAttribute('data-thumb-height');
    if (!temp) {
      data.thumb.height = '0px';
    } else {
      nu = seperateNumberAndUnit(temp.trim());
      if (!nu.number && nu.number !== 0) {
        nu.number = 0;
      }
      if (!nu.unit) {
        nu.unit = 'px';
      }
      data.thumb.height = nu.number + nu.unit;
    }

    data.tick = {};

    // data-tick-position
    temp = target.getAttribute('data-tick-position');
    if (!temp) {
      data.tick.position = 'hidden';
    } else {
      temp = temp.trim();
      switch (temp) {
      case 'hidden':
      case 'bottom':
      case 'inside':
        data.tick.position = temp;
        break;
      default:
        data.tick.position = 'hidden';
        break;
      }
    }

    // data-tick-count
    data.tick.count = +target.getAttribute('data-tick-count');
    if ((!data.tick.count && data.tick.count !== 0) || data.tick.count < 0) {
      data.tick.count = 0;
    }

    return data;
  }

  /*  Build slider in target
  */
  function buildSlider(target) {
    var
      trackAElem, trackIElem, tickmarkElem, thumbElem,
      data, calc, i;

    // 1. get attributes
    data = getAttributesFromTarget(target);


    // 2. build DOM and apply styles which must be defined

    // 2.1. create div elements and add classes to them
    trackAElem = document.createElement('div');
    trackIElem = document.createElement('div');
    tickmarkElem = document.createElement('div');
    thumbElem = document.createElement('div');

    trackAElem.classList.add('track-active');
    trackIElem.classList.add('track-inactive');
    tickmarkElem.classList.add('tickmark');
    thumbElem.classList.add('thumb');

    // 2.2. apply styles which must be defined automatically
    calc = {}; // macro for CSS calc(exp) function
    calc.validWidth =
      '(' + data.width + ' - ' + data.track.capWidth + ' * 2)';
    calc.percentage =
      (data.value - data.min) / (data.max - data.min);
    // (thumb.height - track.height) / 2
    calc.trackTop =
      '(' + data.thumb.height + ' - ' + data.track.height + ') / 2';
    calc.trackActiveWidth =
      '(' + calc.validWidth + ' * ' + calc.percentage +
      ' + ' + data.track.capWidth + ')';

    target.style.width = data.width;
    target.style.height = data.thumb.height;

    // {validWidth} * (value - min) / (max - min) + track.capWidth
    trackAElem.style.width = 'calc(' + calc.trackActiveWidth + ')';
    trackAElem.style.top = 'calc(' + calc.trackTop + ')';
    trackAElem.style.height = data.track.height;

    // {validWidth} * (1 - (value - min) / (max - min)) + track.capWidth
    trackIElem.style.width =
      'calc(' + calc.validWidth + ' * ' + '(1 - ' + calc.percentage + ')' +
      ' + ' + data.track.capWidth + ')';
    trackIElem.style.top = 'calc(' + calc.trackTop + ')';
    trackIElem.style.left = trackAElem.style.width;
    trackIElem.style.height = data.track.height;

    if (data.tick.position === 'inside') {
      tickmarkElem.style.width = 'calc(' + calc.validWidth + ')';
      tickmarkElem.style.height = data.track.height;
      tickmarkElem.style.top = 'calc(' + calc.trackTop + ')';
      tickmarkElem.style.left = data.track.capWidth;
    } else if (data.tick.position === 'bottom') {
      tickmarkElem.style.width = 'calc(' + calc.validWidth + ')';
      tickmarkElem.style.height = 'calc(' + calc.trackTop + ')';
      tickmarkElem.style.top =
        'calc(' + calc.trackTop + ' + ' + data.track.height + ')';
      tickmarkElem.style.left = data.track.capWidth;
    } else {
      tickmarkElem.style.visibility = 'hidden';
      tickmarkElem.style.width = 'calc(' + calc.validWidth + ')';
      tickmarkElem.style.left = data.track.capWidth;
    }

    // track.active.width - thumb.width / 2
    thumbElem.style.left =
      'calc(' + calc.trackActiveWidth + ' - ' + data.thumb.width + ' / 2)';
    thumbElem.style.width = data.thumb.width;
    thumbElem.style.height = data.thumb.height;

    // 2.3. build DOM
    for (i = 0; i < data.tick.count; i += 1) {
      tickmarkElem.appendChild(document.createElement('hr'));
    }
    target.appendChild(trackAElem);
    target.appendChild(trackIElem);
    target.appendChild(tickmarkElem);
    target.appendChild(thumbElem);


    // 3. add event listeners
    (function () {
      function updateSlider(e) {
        var
          wrapperLeft,
          trackCapWidth,
          trackSettableWidth,
          trackFullWidth,
          thumbHalfWidth,
          thumbLeft, thumbLeftMin, thumbLeftMax;
        wrapperLeft = target.offsetLeft;
        trackCapWidth = tickmarkElem.offsetLeft;
        trackSettableWidth = tickmarkElem.offsetWidth;
        trackFullWidth = trackSettableWidth + trackCapWidth * 2;
        thumbHalfWidth = thumbElem.offsetWidth / 2;
        thumbLeft = e.clientX - wrapperLeft - thumbHalfWidth;
        thumbLeftMin = trackCapWidth - thumbHalfWidth;
        thumbLeftMax = trackFullWidth - trackCapWidth - thumbHalfWidth;
        if (thumbLeft < thumbLeftMin) {
          thumbElem.style.left = thumbLeftMin + 'px';
          trackAElem.style.width = trackCapWidth + 'px';
          trackIElem.style.width = (trackCapWidth + trackSettableWidth) + 'px';
          trackIElem.style.left = trackAElem.style.width;
          target.dataset.value = data.min;
        } else if (thumbLeft > thumbLeftMax) {
          thumbElem.style.left = thumbLeftMax + 'px';
          trackAElem.style.width = (trackCapWidth + trackSettableWidth) + 'px';
          trackIElem.style.width = trackCapWidth + 'px';
          trackIElem.style.left = trackAElem.style.width;
          target.dataset.value = data.max;
        } else {
          thumbElem.style.left = thumbLeft + 'px';
          trackAElem.style.width = (e.clientX - wrapperLeft) + 'px';
          trackIElem.style.width =
            (trackFullWidth - (e.clientX - wrapperLeft)) + 'px';
          trackIElem.style.left = trackAElem.style.width;
          target.dataset.value =
            thumbLeft * (data.max - data.min) / trackSettableWidth + (thumbHalfWidth * 2 - 10) / 5;
        }
        console.log(target.dataset.value);
      }

      function sliderMouseMove(e) {
        e = (e || window.event);
        e.preventDefault();
        updateSlider(e);
      }
      function sliderMouseUp(e) {
        e = (e || window.event);
        e.preventDefault();
        document.onmouseup = null;
        document.onmousemove = null;
        target.ontouchstart = sliderTouchStart;
      }
      function sliderMouseDown(e) {
        e = (e || window.event);
        e.preventDefault();
        target.ontouchstart = null;
        sliderMouseMove(e);
        document.onmouseup = sliderMouseUp;
        document.onmousemove = sliderMouseMove;
      }

      function sliderTouchMove(e) {
        e = (e || window.event);
        e.preventDefault();
        updateSlider(e.touches[0]);
      }
      function sliderTouchEnd(e) {
        e = (e || window.event);
        e.preventDefault();
        document.ontouchend = null;
        document.ontouchmove = null;
        target.onmousedown = sliderMouseDown;
      }
      function sliderTouchStart(e) {
        e = (e || window.event);
        e.preventDefault();
        target.onmousedown = null;
        sliderTouchMove(e);
        document.ontouchend = sliderTouchEnd;
        document.ontouchmove = sliderTouchMove;
      }

      target.ontouchstart = sliderTouchStart;
      target.onmousedown = sliderMouseDown;
    }());
  }

  return {

    /*  target이 div.custom-slider면 target에 슬라이더를 업데이트함
        target: div.custom-slider
                div.custom-slider가 아니면 아무 동작도 하지 않음
    */
    updateSlider: function (target) {
      // check whether param is div.custom-slider
      if (target.tagName.toLowerCase() !== 'div' || !target.classList.contains('custom-slider')) {
        return;
      }

      // clear children of div.custom-slider
      clearChildren(target);

      // build slider in div.custom-slider
      buildSlider(target);
    },

    /* targets의 div.custom-slider들을 업데이트함
       targets: Array of div.custom-slider
    */
    updateSliders: function (targets) {
      var i, len;

      // check whether param is iterable
      if (!targets.length) {
        return;
      }

      // update each div.custom-slider in targets
      len = targets.length;
      for (i = 0; i < len; i += 1) {
        this.updateSlider(targets[i]);
      }
    },

    /* 문서 전체의 div.custom-slider들을 초기화함
    */
    initialize: function () {
      var
        i, len,
        elementsWithClass, divsWithClass;

      // get div.custom-slider in the document
      elementsWithClass = document.getElementsByClassName('custom-slider');
      len = elementsWithClass.length;
      divsWithClass = [];
      for (i = 0; i < len; i += 1) {
        if (elementsWithClass[i].tagName.toLowerCase() === 'div') {
          divsWithClass.push(elementsWithClass[i]);
        }
      }

      // update found sliders
      this.updateSliders(divsWithClass);
    }

  };
}
