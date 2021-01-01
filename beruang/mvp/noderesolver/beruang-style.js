class BeruangStyle {

  constructor() {}

  parse(node) {
    node.rules = node.textContent.match(/([^{]+{[^{]*})/g);
  }

  solve(node, presenter) {
    let s = '';
    node.rules.forEach((rule, i) => {
      let matches = rule.match(/(\s*\S+\s*[:]{2}part\s*[(][^(]+[)])\s*{([^{]*)}/);
      if(matches && matches.length>2) {
        presenter.injectedStyles = presenter.injectedStyles || [];
        let selector = matches[1].replace(':host', presenter.localName);
        if(presenter.injectedStyles.indexOf(selector)===-1) {
          let css = this.ensureDocSheet();
          this.addDocRule(css, selector, matches[2], 0);
          presenter.injectedStyles.push(selector);
        }
      } else {
          s += rule;
      }
    });
    node.textContent = s;
  }

  ensureDocSheet() {
    let css = document.styleSheets;
    if(css.length==0) {
      let style = document.createElement("style");
      style.appendChild(document.createTextNode(""));//WebKit need this
      document.head.appendChild(style);
      css = document.styleSheets;
    }
    return css[css.length-1];
  }

  addDocRule(sheet, selector, rules, index) {
  	if("insertRule" in sheet) {
  		sheet.insertRule(selector + "{" + rules + "}", index);
  	}
  	else if("addRule" in sheet) {
  		sheet.addRule(selector, rules, index);
  	}
  }
}

export {BeruangStyle};
