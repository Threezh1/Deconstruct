// ==UserScript==
// @name         JSFinder
// @namespace    Threezh1
// @version      0.1
// @description  Extract interfaces from html and javascript files.
// @author       Threezh1
// @match        *://*.cuit.edu.cn/*
// @require      https://greasyfork.org/scripts/12447-mootools-for-greasemonkey/code/MooTools%20for%20Greasemonkey.js?version=74469
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log(location.href);
    urls = []
    $$('*').forEach(element => {
        urls.push(element.src)
        urls.push(element.href)
        urls.push(element.url)
    }); console.log(...new Set(urls))
})();