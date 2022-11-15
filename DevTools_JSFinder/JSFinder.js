// ==UserScript==
// @name         JSFinder
// @namespace    Threezh1
// @version      0.2
// @description  Extract interfaces from html and javascript files.
// @author       Threezh1
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("JSFinder by Threezh1");
    let urls = []; let js_content=""; let result_raw = []; let domains = [];
    [...document.querySelectorAll('*')].forEach(element => {
        urls.push(element.src);urls.push(element.href);urls.push(element.url);
        if (element.tagName == "SCRIPT") { js_content += element.text }
    }); urls = new Set(urls);
    urls.forEach(rawurl => {
        if (rawurl != undefined && rawurl != "" && typeof(rawurl) == "string" && rawurl.startsWith("http") == true){
            let url = new URL(rawurl);
            if (url.host.endsWith(getMainHost()) == true) { domains.push(url.host) };
            if (url.host.endsWith(location.host) == true && url.pathname.endsWith(".js") == true) {
                result_raw = result_raw.concat(extract_url(geturlContent(url.pathname)));
            }
        }
    });
    result_raw = result_raw.concat(extract_url(js_content));
    var result = [];
    result_raw.forEach(url=>{
        if (new URL(url).host.endsWith(getMainHost()) == true) { domains.push(new URL(url).host) };
        if ("jpeg|png|gif|svg|js|flv|swf|css".search(new URL(url).pathname.split('.').pop().toLowerCase()) == -1){
            result.push(url);
        }
    })
    console.log("JSFinder get domains: ", Array.from(new Set(domains)));
    console.log("JSFinder get urls: ", Array.from(new Set(result)));
    function getMainHost() {
        let key = `mh_${Math.random()}`;
        let keyR = new RegExp( `(^|;)\\s*${key}=12345` );
        let expiredTime = new Date( 0 );
        let domain = document.domain;
        let domainList = domain.split( '.' );
        let urlItems = [];
        urlItems.unshift( domainList.pop() );
        while( domainList.length ) {
            urlItems.unshift( domainList.pop() );
            let mainHost = urlItems.join( '.' );
            let cookie = `${key}=${12345};domain=.${mainHost}`;
            document.cookie = cookie;
            if ( keyR.test( document.cookie ) ) {
                document.cookie = `${cookie};expires=${expiredTime}`;
                return mainHost;
            }}}
    function geturlContent(pathname){
        var result = ""
        var request = new XMLHttpRequest();
        request.open("GET", pathname, false);
        request.send();
        if(request.status === 200){
            result = request.responseText;
        }
        return result
    }
    function extract_url(js_content){
        let regex = /(?:"|')(((?:[a-zA-Z]{1,10}:\/\/|\/\/)[^"'\/]{1,}\.[a-zA-Z]{2,}[^"']{0,})|((?:\/|\.\.\/|\.\/)[^"'><,;| *()(%%$^\/\\\[\]][^"'><,;|()]{1,})|([a-zA-Z0-9_\-\/]{1,}\/[a-zA-Z0-9_\-\/]{1,}\.(?:[a-zA-Z]{1,4}|action)(?:[\?|\/][^"|']{0,}|))|([a-zA-Z0-9_\-]{1,}\.(?:php|asp|aspx|jsp|json|action|html|js|txt|xml)(?:\?[^"|']{0,}|)))(?:"|')/sg;
        let m; result = [];
        while ((m = regex.exec(js_content)) !== null) {
            if (m.index === regex.lastIndex) { regex.lastIndex++;}
            m.forEach((match, groupIndex) => {
                if (match != undefined) {
                    match = match.replaceAll(/('|")/g, "");
                    if (match.startsWith("http") == true){
                        let suburl = new URL(match);
                        if (suburl.host.endsWith(getMainHost()) == true){ result.push(match); }
                    }else{
                        let url = new URL(match, location.origin);
                        if (url.host.endsWith(getMainHost()) == true){ result.push(url.href); }
                    }}});}
        return Array.from(new Set(result));
    }
})();
