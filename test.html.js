/*jslint
  browser: true
  regexp: true
*/
/*global
  document, window, CustomSlider
*/


var crc8 = (function () {
  'use strict';
  var crc8enc = [
    '00', '07', '0e', '09', '1c', '1b', '12', '15',
    '38', '3f', '36', '31', '24', '23', '2a', '2d',
    '70', '77', '7e', '79', '6c', '6b', '62', '65',
    '48', '4f', '46', '41', '54', '53', '5a', '5d',
    'e0', 'e7', 'ee', 'e9', 'fc', 'fb', 'f2', 'f5',
    'd8', 'df', 'd6', 'd1', 'c4', 'c3', 'ca', 'cd',
    '90', '97', '9e', '99', '8c', '8b', '82', '85',
    'a8', 'af', 'a6', 'a1', 'b4', 'b3', 'ba', 'bd',
    'c7', 'c0', 'c9', 'ce', 'db', 'dc', 'd5', 'd2',
    'ff', 'f8', 'f1', 'f6', 'e3', 'e4', 'ed', 'ea',
    'b7', 'b0', 'b9', 'be', 'ab', 'ac', 'a5', 'a2',
    '8f', '88', '81', '86', '93', '94', '9d', '9a',
    '27', '20', '29', '2e', '3b', '3c', '35', '32',
    '1f', '18', '11', '16', '03', '04', '0d', '0a',
    '57', '50', '59', '5e', '4b', '4c', '45', '42',
    '6f', '68', '61', '66', '73', '74', '7d', '7a',
    '89', '8e', '87', '80', '95', '92', '9b', '9c',
    'b1', 'b6', 'bf', 'b8', 'ad', 'aa', 'a3', 'a4',
    'f9', 'fe', 'f7', 'f0', 'e5', 'e2', 'eb', 'ec',
    'c1', 'c6', 'cf', 'c8', 'dd', 'da', 'd3', 'd4',
    '69', '6e', '67', '60', '75', '72', '7b', '7c',
    '51', '56', '5f', '58', '4d', '4a', '43', '44',
    '19', '1e', '17', '10', '05', '02', '0b', '0c',
    '21', '26', '2f', '28', '3d', '3a', '33', '34',
    '4e', '49', '40', '47', '52', '55', '5c', '5b',
    '76', '71', '78', '7f', '6a', '6d', '64', '63',
    '3e', '39', '30', '37', '22', '25', '2c', '2b',
    '06', '01', '08', '0f', '1a', '1d', '14', '13',
    'ae', 'a9', 'a0', 'a7', 'b2', 'b5', 'bc', 'bb',
    '96', '91', '98', '9f', '8a', '8d', '84', '83',
    'de', 'd9', 'd0', 'd7', 'c2', 'c5', 'cc', 'cb',
    'e6', 'e1', 'e8', 'ef', 'fa', 'fd', 'f4', 'f3'];
  return {
    get: function (src) {
      if (src < 256 && src >= 0) {
        return crc8enc[Math.floor(src)];
      } else {
        return undefined;
      }
    }
  };
}());


var testgame = (function () {
  'use strict';
  var customSlider, stages, tickCounts, thumbWidths, currentStage0, sumOfErrors;

  customSlider = new CustomSlider();

  tickCounts = [0, 2, 3, 4, 5, 6, 7, 9, 11];
  thumbWidths = [10, 20, 30, 40];
  stages = [];
  sumOfErrors = 0;

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // Durstenfeld shuffle
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  function initializeStagesImpl() {
    var tc, tw, tcl, twl, s;
    tcl = tickCounts.length;
    twl = thumbWidths.length;
    s = 0;
    stages = [];
    for (tc = 0; tc < tcl; tc += 1) {
      for (tw = 0; tw < twl; tw += 1) {
        stages.push({
          serial: s,
          initialValue: Math.random() * 60 + 20,
          targetValue: Math.floor(Math.random() * 91) + 5,
          tickCount: tickCounts[tc],
          thumbWidth: thumbWidths[tw]
        });
        s += 1;
      }
    }
    stages = shuffle(stages);
    currentStage0 = 0;
    sumOfErrors = 0;
  }

  function loadStageImpl() {
    var stage, stageNum1, sliderDiv;
    stage = stages[currentStage0];
    stageNum1 = currentStage0 + 1;
    document.getElementById('stage-length-span').innerHTML = String(stages.length);
    document.getElementById('stage-span').innerHTML = String(stageNum1);
    document.getElementById('target-span').innerHTML = String(stage.targetValue);
    sliderDiv = document.getElementById('slider-div');
    sliderDiv.dataset.value = stage.initialValue;
    sliderDiv.dataset.thumbWidth = stage.thumbWidth;
    sliderDiv.dataset.tickCount = stage.tickCount;
    customSlider.updateSlider(sliderDiv);
  }

  function storeStageResultImpl() {
    var stage, stageNum1, sliderDiv, currentError;
    stage = stages[currentStage0];
    stageNum1 = currentStage0 + 1;
    sliderDiv = document.getElementById('slider-div');

    currentError = Math.abs(stage.targetValue - (+sliderDiv.dataset.value));
    sumOfErrors += currentError;
    
    // GA로 데이터 전송
    /*
    stageNum1
    stage.initialValue
    stage.targetValue
    stage.thumbWidth
    stage.tickCount
    sliderDiv.dataset.value
    */

    currentStage0 += 1;
  }
  
  function getStage0Impl() {
    return currentStage0;
  }

  function getStageLengthImpl() {
    return stages.length;
  }

  function displayGameResultImpl() {
    var accuracy, score;
    score = Math.floor(Math.max(100 - 4 * sumOfErrors / stages.length, 0));
    accuracy = Math.round((100 - sumOfErrors / stages.length) * 1000) / 1000;
    /*
    console.log(sumOfErrors);
    console.log(stages.length);
    console.log(score);
    console.log(accuracy);
    */
    document.getElementById('score-span').innerHTML = score;
    document.getElementById('accuracy-span').innerHTML = accuracy;
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('result-section').style.display = '';
  }

  return {
    initializeStages: initializeStagesImpl,
    loadStage: loadStageImpl,
    storeStageResult: storeStageResultImpl,
    getStage0: getStage0Impl,
    getStageLength: getStageLengthImpl,
    displayGameResult: displayGameResultImpl
  };
}());


function sliderReleased() {
  'use strict';
  document.removeEventListener('touchend', sliderReleased);
  document.removeEventListener('mouseup', sliderReleased);
  window.setTimeout(function () {
    testgame.storeStageResult();
    if (testgame.getStage0() < testgame.getStageLength()) {
      testgame.loadStage();
    } else {
      testgame.displayGameResult();
    }
  }, 50);
}

function sliderPressed() {
  'use strict';
  document.addEventListener('touchend', sliderReleased);
  document.addEventListener('mouseup', sliderReleased);
}

function init() {
  'use strict';
  var sliderDiv;
  testgame.initializeStages();
  testgame.loadStage(0);
  sliderDiv = document.getElementById('slider-div');
  sliderDiv.addEventListener('touchstart', sliderPressed);
  sliderDiv.addEventListener('mousedown', sliderPressed);
}
window.addEventListener('DOMContentLoaded', init);
