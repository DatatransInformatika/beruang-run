let css = document.styleSheets;
if(css.length==0) {
  let style = document.createElement("style");
  style.appendChild(document.createTextNode(""));//WebKit need this
  document.head.appendChild(style);
  css = document.styleSheets;
}
let path = window.rootpath + 'beruang/mvp/view/style/fonts/';
let sheet = css[css.length-1];
let selector = '@font-face';
let rules = 'font-family: "Roboto";';
rules += 'src: url("' + path + 'roboto/Roboto-Regular.ttf' + '") format("truetype");';
if("insertRule" in sheet) {
  sheet.insertRule(selector + "{" + rules + "}", 0);
} else if("addRule" in sheet) {
  sheet.addRule(selector, rules, 0);
}
