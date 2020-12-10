# DevTools里的JSFinder与油猴脚本

## 前言

于前天在推特上看到Hpdoger师傅转了一个推：
![-w746](https://sanzhi-1259392731.cos.ap-chengdu.myqcloud.com/2020/12/11/16076219424271.jpg)

是一个人分享了一段javascript代码，在DevTools上执行可以直接获取到html所有标签属性里的url。代码如下：

```javascript
urls = []
$$('*').forEach(element => {
  urls.push(element.src)
  urls.push(element.href)
  urls.push(element.url)
}); console.log(...new Set(urls))
```

以小米官网为例：
![-w1790](https://sanzhi-1259392731.cos.ap-chengdu.myqcloud.com/2020/12/11/16076221055725.jpg)

这段js代码的作用把我吓到了，6行代码把jsfinder的功能实现的差不多了...我仔细研究了一下，发现它只是遍历的标签的属性，却没有对js文件里的url进行提取。只是简单的遍历的话没什么太大的用，所以我打算自己根据这个思路，把jsfinder上的功能往这个上面挪一挪。

下面就是三个不同的程度的利用：

1. 通过html源码里的各种连接获取子域名
2. 实现jsfinder获取所有接口
3. JSFinder油猴脚本

## 通过html源码里的各种连接获取子域名

获取根域名我参考了这篇文章：https://developer.aliyun.com/article/195912 相比于直接截断判断，文章中这种获取的方式就靠谱很多了。
直接贴源码：

```js
urls = []; domains = [];
$$('*').forEach(element => {
    urls.push(element.src);urls.push(element.href);urls.push(element.url);
}); urls = new Set(urls);
urls.forEach(url => {
    if (url != undefined && url != "" && url.startsWith("http") == true){
        url = new URL(url);
        if (url.host.endsWith(getMainHost()) == true) {
            domains.push(url.host)
        }
    }
});
console.log(Array.from(new Set(domains)));
function getMainHost() {
  let key  = `mh_${Math.random()}`;
  let keyR = new RegExp( `(^|;)\\s*${key}=12345` );
  let expiredTime = new Date( 0 );
  let domain = document.domain;
  let domainList = domain.split( '.' );
  let urlItems   = [];
  urlItems.unshift( domainList.pop() );
  while( domainList.length ) {
    urlItems.unshift( domainList.pop() );
    let mainHost = urlItems.join( '.' );
    let cookie   = `${key}=${12345};domain=.${mainHost}`;
    document.cookie = cookie;
    if ( keyR.test( document.cookie ) ) {
      document.cookie = `${cookie};expires=${expiredTime}`;
      return mainHost;
    }
  }
}
```

![-w1786](https://sanzhi-1259392731.cos.ap-chengdu.myqcloud.com/2020/12/11/16076228671417.jpg)

## 实现jsfinder获取所有接口

只获取域名是不太够的，接着来获取接口(严格来说这里其实也是url，只不过把js里面的url也提取出来了)。

这里有几个简单的问题存在：

1. 接口存在于js文件里，怎么通过js获取js文件内容？
2. 不同路径的处理是不是跟jsfinder原来一样需要写很多的判断处理语句？
3. 接口到底是获取全子域的还是只获取当前域的？

这些问题对应的解决办法：

1. 可以直接用xmlHttpRequest同步方法获取文件内容
2. 不需要，可以使用`new URL()`这种方式组合url，会自动处理url中的层级关系 (这个有点好用)
3. 只获取当前域的接口太少了，我选择的方式是连接获取当前域，接口获取全子域。这样既保证了爬取的页面不会太多，接口数量和质量也有所保障。

```js
urls = []; js_content=""; result_raw = [];
$$('*').forEach(element => {
    urls.push(element.src);urls.push(element.href);urls.push(element.url);
    if (element.tagName == "SCRIPT") { js_content += element.text }
}); urls = new Set(urls);
urls.forEach(rawurl => {
    if (rawurl != undefined && rawurl != "" && typeof(rawurl) == "string" && rawurl.startsWith("http") == true){
        url = new URL(rawurl);
        if (url.host.endsWith(location.host) == true && url.pathname.endsWith(".js") == true) {
            result_raw = result_raw.concat(extract_url(geturlContent(url.pathname)));
        }
    }
});
result_raw = result_raw.concat(extract_url(js_content));
result = [];
result_raw.forEach(url=>{
    if ("jpeg|png|gif|svg|js|flv|swf|css".search(new URL(url).pathname.split('.').pop().toLowerCase()) == -1){
        result.push(url);
    }
})
console.log(Array.from(new Set(result)));
function getMainHost() {
  let key  = `mh_${Math.random()}`;
  let keyR = new RegExp( `(^|;)\\s*${key}=12345` );
  let expiredTime = new Date( 0 );
  let domain = document.domain;
  let domainList = domain.split( '.' );
  let urlItems   = [];
  urlItems.unshift( domainList.pop() );
  while( domainList.length ) {
    urlItems.unshift( domainList.pop() );
    let mainHost = urlItems.join( '.' );
    let cookie   = `${key}=${12345};domain=.${mainHost}`;
    document.cookie = cookie;
    if ( keyR.test( document.cookie ) ) {
      document.cookie = `${cookie};expires=${expiredTime}`;
      return mainHost;d
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
                suburl = new URL(match);
                if (suburl.host.endsWith(getMainHost()) == true){ result.push(match); }
            }else{
                url = new URL(match, location.origin);
                if (url.host.endsWith(getMainHost()) == true){ result.push(url.href); }
            }}});}
    return Array.from(new Set(result));
}
```

![-w1788](https://sanzhi-1259392731.cos.ap-chengdu.myqcloud.com/2020/12/11/16076232670876.jpg)

## JSFinder油猴脚本

如果每次去获取域名接口都要复制一段js代码的话，那就太麻烦了。所以就写了一个油猴脚本来方便使用，每次打开网站都会自动的获取域名与接口。自己在网站测试过程中也可以自行设置域名范围(在油猴脚本中修改`match`配置)。

最终源码：

```js
// ==UserScript==
// @name         JSFinder
// @namespace    Threezh1
// @version      0.2
// @description  Extract interfaces from html and javascript files.
// @author       Threezh1
// @match        *://*/*
// @require      https://greasyfork.org/scripts/12447-mootools-for-greasemonkey/code/MooTools%20for%20Greasemonkey.js?version=74469
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("JSFinder by Threezh1");
    let urls = []; let js_content=""; let result_raw = []; let domains = [];
    $$('*').forEach(element => {
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
```

在油猴处启动脚本之后打开小米官网，可以看到已经成功运行：

![-w1789](https://sanzhi-1259392731.cos.ap-chengdu.myqcloud.com/2020/12/11/16076235698941.jpg)
