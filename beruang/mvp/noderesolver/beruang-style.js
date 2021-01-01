class BeruangStyle {

  constructor() {}

  parse(node, presenter) {
    node.rules = node.textContent.match(/([^{]+{[^{]*})/g);
    node.dynStartIndex = node.rules.length;
    let rslt = this.parseDo(node.rules, presenter);
    if(rslt.inject) {
      node.textContent = rslt.stmt;
    }
  }

  update(selector, rule, presenter) {

  }

  remove(selector) {

  }

  parseDo(rules, presenter) {
    let rslt = {'inject':false, 'stmt':''};
    rules.forEach((rule, i) => {
      let matches = rule.match(/(\s*[:]host\s*[:]{2}part\s*[(][^(]+[)])\s*{([^{]*)}/);
      if(matches && matches.length>2) {
        rslt.inject = true;
        presenter.injectedStyles = presenter.injectedStyles || [];
        let selector = matches[1].replace(':host', presenter.localName);
        if(presenter.injectedStyles.indexOf(selector)===-1) {
          let sheet = this.ensureDocSheet();
          this.addDocRule(sheet, selector, matches[2], 0);
          presenter.injectedStyles.push(selector);
        }
      } else {
          rslt.stmt += rule;
      }
    });
    return rslt;
  }

  solve(node, presenter) {
    if(node.rules.length<=node.dynStartIndex) {
      return;
    }
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
