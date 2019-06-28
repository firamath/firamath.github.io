/* eslint-disable no-multi-spaces */
'use strict';

const blockData = [
  {from: 0x0020,  to: 0x007f,  name: 'Basic Latin'},
  {from: 0x00a0,  to: 0x00ff,  name: 'Latin-1 Supplement'},
  {from: 0x0100,  to: 0x017f,  name: 'Latin Extended-A'},
  {from: 0x0180,  to: 0x024f,  name: 'Latin Extended-B'},
  {from: 0x0300,  to: 0x036f,  name: 'Combining Diacritical Marks'},
  {from: 0x0370,  to: 0x03ff,  name: 'Greek and Coptic'},
  {from: 0x0400,  to: 0x04ff,  name: 'Cyrillic'},
  {from: 0x2000,  to: 0x206f,  name: 'General Punctuation'},
  {from: 0x20a0,  to: 0x20cf,  name: 'Currency Symbols'},
  {from: 0x20d0,  to: 0x20ff,  name: 'Combining Diacritical Marks for Symbols'},
  {from: 0x2100,  to: 0x214f,  name: 'Letterlike Symbols'},
  {from: 0x2150,  to: 0x218f,  name: 'Number Forms'},
  {from: 0x2190,  to: 0x21ff,  name: 'Arrows'},
  {from: 0x2200,  to: 0x22ff,  name: 'Mathematical Operators'},
  {from: 0x2300,  to: 0x23ff,  name: 'Miscellaneous Technical'},
  {from: 0x2580,  to: 0x259f,  name: 'Block Elements'},
  {from: 0x25a0,  to: 0x25ff,  name: 'Geometric Shapes'},
  {from: 0x2600,  to: 0x26ff,  name: 'Miscellaneous Symbols'},
  {from: 0x27c0,  to: 0x27ef,  name: 'Miscellaneous Mathematical Symbols-A'},
  {from: 0x27f0,  to: 0x27ff,  name: 'Supplemental Arrows-A'},
  {from: 0x2900,  to: 0x297f,  name: 'Supplemental Arrows-B'},
  {from: 0x2980,  to: 0x29ff,  name: 'Miscellaneous Mathematical Symbols-B'},
  {from: 0x2a00,  to: 0x2aff,  name: 'Supplemental Mathematical Operators'},
  {from: 0x2b00,  to: 0x2bff,  name: 'Miscellaneous Symbols and Arrows'},
  {from: 0xfb00,  to: 0xfb4f,  name: 'Alphabetic Presentation Forms'},
  {from: 0xfe70,  to: 0xfeff,  name: 'Arabic Presentation Forms-B'},
  {from: 0x1d400, to: 0x1d7ff, name: 'Mathematical Alphanumeric Symbols'},
  {from: 0x1f780, to: 0x1f7ff, name: 'Geometric Shapes Extended'},
];

function blockContent(weight) {
  return blockData.map((e) => _blockContent(e, weight)).join('');
}
function _blockContent(entry, weight) {
  const header = `<h3><span>${entry.name}</span></h3>`;
  const content = _table(entry.from, entry.to, weight);
  return `<div class='show'>${header}${content}</div>`;
}
function _table(from, to, weight) {
  let tbody = '';
  for (let i = 0; i < (to - from) / 16; i++) {
    let row = tdIndicator(from + 16 * i);
    for (let j = 0; j < 16; j++) row += tdChar(from + 16 * i + j, weight);
    tbody += `<tr>${row}</tr>`;
  }
  return `<table class='block'><tbody>${tbody}</tbody></table>`;
}
function tdIndicator(x) {
  return `<td class='indicator'>0x${_toUSV(x)}</td>`;
}
function _toUSV(x) {
  return _padZero(x.toString(16), 4).toUpperCase();
}
function _padZero(s, n) {
  while (s.length < n) s = '0' + s; return s;
}
function tdChar(x, weight) {
  if (firaMathChar['FiraMath-' + weight].includes(x)) {
    return `<td><span class='char'>&#${x};</span></td>`;
  } else {
    return `<td><span class='char missing'>&#${x};</span></td>`;
  }
}

// Initial
const blockElement = document.querySelector('#specimen');
function updateWeight(weight) {
  blockElement.innerHTML = blockContent(weight);
  blockElement.className = 'FiraMath-' + weight;
}
updateWeight('Regular');

const weightPicker = document.querySelector('#picker');
const weightMenu   = document.querySelector('#menu');
weightPicker.onmouseover = () => weightMenu.className = '';
weightPicker.onmouseout  = () => weightMenu.className = 'invisible';

document.querySelector('#picker-Thin')      .onclick = () => updateWeight('Thin');
document.querySelector('#picker-UltraLight').onclick = () => updateWeight('UltraLight');
document.querySelector('#picker-ExtraLight').onclick = () => updateWeight('ExtraLight');
document.querySelector('#picker-Light')     .onclick = () => updateWeight('Light');
document.querySelector('#picker-Book')      .onclick = () => updateWeight('Book');
document.querySelector('#picker-Regular')   .onclick = () => updateWeight('Regular');
document.querySelector('#picker-Medium')    .onclick = () => updateWeight('Medium');
document.querySelector('#picker-SemiBold')  .onclick = () => updateWeight('SemiBold');
document.querySelector('#picker-Bold')      .onclick = () => updateWeight('Bold');
document.querySelector('#picker-ExtraBold') .onclick = () => updateWeight('ExtraBold');
document.querySelector('#picker-Heavy')     .onclick = () => updateWeight('Heavy');
document.querySelector('#picker-Ultra')     .onclick = () => updateWeight('Ultra');
