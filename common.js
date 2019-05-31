/*jslint
  browser: true
  regexp: true
*/
/*global
  document, navigator, window
*/

// https://stackoverflow.com/questions/34045777/
function iosCopyToClipboard(el) {
  'use strict';
  var oldContentEditable, oldReadOnly, range, s;

  oldContentEditable = el.contentEditable;
  oldReadOnly = el.readOnly;
  range = document.createRange();

  el.contentEditable = true;
  el.readOnly = false;
  range.selectNodeContents(el);

  s = window.getSelection();
  s.removeAllRanges();
  s.addRange(range);

  el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

  el.contentEditable = oldContentEditable;
  el.readOnly = oldReadOnly;

  document.execCommand('copy');

  el.blur();
}

function copyToClipboard(el) {
  'use strict';
  el.select();
  document.execCommand('copy');
  el.blur();
}

function hideCopiedMessage() {
  'use strict';
  var msgElem = document.getElementById('copymsg-span');
  msgElem.style.transition = 'opacity 0.5s';
  msgElem.style.opacity = '0';
}
function shareClicked() {
  'use strict';
  var textElem, msgElem;
  textElem = document.getElementById('share-text');
  if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
    iosCopyToClipboard(textElem);
  } else {
    copyToClipboard(textElem);
  }
  msgElem = document.getElementById('copymsg-span');
  msgElem.style.transition = '';
  msgElem.style.backgroundColor = 'rgba(192, 224, 255, 1)';
  msgElem.style.opacity = '1';
  textElem.style.transition = '';
  textElem.style.backgroundColor = 'rgba(192, 224, 255, 1)';
  window.setTimeout(function () {
    msgElem.style.transition = 'background-color 1s';
    msgElem.style.backgroundColor = 'rgba(192, 224, 255, 0)';
    textElem.style.transition = 'background-color 1s';
    textElem.style.backgroundColor = '';
  }, 50);
  window.setTimeout(hideCopiedMessage, 2000);
}

function initCommon() {
  'use strict';
  document.getElementById('share-a').addEventListener('click', shareClicked);
  //document.getElementById('share-text').addEventListener('click', shareClicked);
}
window.addEventListener('DOMContentLoaded', initCommon);
