'use strict';

const filename = window.location.href.split('/').pop();

const navTags = {
  index:    'Home',
  specimen: 'Specimen',
  lab:      'Lab',
};

let navHTML = '<ul class="toc-links">';
for (const i of Object.keys(navTags)) {
  const navName = `<a href='${i}.html'>${navTags[i]}</a>`;
  if (i + '.html' === filename) {
    navHTML += `<li class='selected'>${navName}</li>`;
  } else {
    navHTML += `<li>${navName}</li>`;
  }
}
navHTML += '</ul>';
document.querySelector('nav').innerHTML = navHTML;
