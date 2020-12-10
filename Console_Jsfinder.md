## 获取页面所有的url

```javascript
urls = []
$$('*').forEach(element => {
  urls.push(element.src)
  urls.push(element.href)
  urls.push(element.url)
}); console.log(...new Set(urls))
```

## 获取页面所有的域名

```javascript
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

## 获取所有api接口

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