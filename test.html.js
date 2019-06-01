/*jslint
  browser: true
  regexp: true
*/
/*global
  document, window, ga, CustomSlider
*/


var encoder100 = (function () {
  'use strict';
  var enc = [
    '7d', '4e', 'c5', 'b6', '0a', 'd9', 'e6', '6c', 'cd', '4c',
    'd7', 'fe', 'f5', 'cf', '7f', '0f', 'e8', '5b', 'a9', '9b',
    'd1', 'f7', '7e', 'a4', '6d', 'be', 'da', 'd8', 'b7', '2e',
    '5c', '8a', 'bd', 'e4', 'd5', 'af', '6b', '1b', 'eb', '5a',
    'ba', '0c', '1a', 'c0', 'b1', 'a5', '1f', 'ce', 'b5', 'dc',
    'a6', '3a', 'e1', 'f9', 'c7', '2b', 'c1', '4a', '0d', '6a',
    '9e', '7c', 'fa', 'a3', '4b', 'de', 'e2', '7a', '2c', 'a0',
    'c6', '2a', 'd3', '5f', 'bc', 'db', 'fd', '1c', 'b4', 'e9',
    'ea', 'd6', 'f3', 'df', '0e', 'b3', 'cb', 'b0', 'fb', '9a',
    'b2', '8c', 'bf', 'ef', 'ed', '3f', 'b8', '9c', 'c3', 'd4', '4f'];
  return {
    get: function (src) {
      if (src <= 100 && src >= 0) {
        return enc[Math.floor(src)];
      } else {
        return undefined;
      }
    }
  };
}());


var testgame = (function () {
  'use strict';
  var
    customSlider,
    stages, tickCounts, thumbWidths,
    currentStage0, sumOfErrors;

  customSlider = new CustomSlider();

  tickCounts = [0, 2, 3, 4, 5, 6, 7, 9, 11];
  thumbWidths = [10, 20, 30, 40];
  stages = [];

  // https://stackoverflow.com/questions/2450954/
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

  function initializeGameImpl() {
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
    var stage, sliderDiv, currentError;
    stage = stages[currentStage0];
    sliderDiv = document.getElementById('slider-div');

    currentError = Math.abs(stage.targetValue - (+sliderDiv.dataset.value));
    sumOfErrors += currentError;

    // send data with GA
    ga('send', {
      hitType: 'event',
      eventCategory: '(' + stage.tickCount + ',' + stage.thumbWidth + ')',
      eventAction: '(' +
        Math.round(stage.initialValue) + ',' +
        stage.targetValue + ')',
      eventLabel: String(currentError)
    });

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
    document.getElementById('score-span').innerHTML = score;
    document.getElementById('accuracy-span').innerHTML = accuracy;
    document.getElementById('share-text').value =
      'https://leeye51456.github.io/handtest/link/' +
      encoder100.get(score) + '.html';
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('result-section').style.display = '';
  }

  return {
    initializeGame: initializeGameImpl,
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
  ga('create', 'UA-140849964-1', 'auto');
  testgame.initializeGame();
  testgame.loadStage(0);
  sliderDiv = document.getElementById('slider-div');
  sliderDiv.addEventListener('touchstart', sliderPressed);
  sliderDiv.addEventListener('mousedown', sliderPressed);
}
window.addEventListener('DOMContentLoaded', init);
