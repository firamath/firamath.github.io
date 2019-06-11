"use strict";

// var bodyElement = document.querySelector("body");
// var scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
// var marginLeft = parseFloat(window.getComputedStyle(bodyElement).marginLeft);
// bodyElement.setAttribute("style", `margin-left: ${String(marginLeft + scrollBarWidth / 2)}px`);

var filename = window.location.href.split("/").pop();

var navTags = {
    "index.html":    "Home",
    "specimen.html": "Specimen",
    "lab.html":      "Lab"
}

var navHTML = "<ul class='toc-links'>";
for (var i in navTags) {
    var navName = `<a href='${i}'>${navTags[i]}</a>`;
    if (i == filename)
        navHTML += `<li class='selected'>${navName}</li>`;
    else
        navHTML += `<li>${navName}</li>`;
}
navHTML += "</ul>";
document.querySelector("nav").innerHTML = navHTML;
