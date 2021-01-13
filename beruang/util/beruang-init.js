function formfactor() {
  let args = location.search;
  let start = args.indexOf("formfactor");
  if (start >= 0) {
    let value = args.substring(start);
    let begin = value.indexOf("=") + 1;
    let end = value.indexOf("&");
    if (end == -1) {
      end = value.length;
    }
    return value.substring(begin, end);
  }
  let ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf("iphone") != -1 || ua.indexOf("ipod") != -1) {
    return "phone";
  } else if (ua.indexOf("ipad") != -1) {
    return "tablet";
  } else if (ua.indexOf("android") != -1) {
    if(ua.indexOf('mobile') != -1){
      return "phone";
    } else {
      return "tablet";
    }
  }
  return "desktop";
};
window.formfactor = formfactor();
if(window.formfactor=="phone" || window.formfactor=="tablet") {
  let meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no";
  let head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(meta);
}
window.rootpath = window.location.pathname;
window.iconset = {};
