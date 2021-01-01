class BeruangStyleResolver {

  constructor() {}

  parse(node, presenter) {
    let obj = {'rules':[], 'include':false};
    this.fetchRules(node, obj);
    node.rules = obj.rules;
    let rslt = this.parseDo(node.rules, presenter);
    if(obj.include || rslt.inject) {
      node.textContent = rslt.stmt;
    }
  }

  fetchRules(styleNode, obj) {
    if(styleNode.hasAttribute('include')){
      let attr = styleNode.getAttribute('include').trim();
      attr = attr.replace(/[ ]+/g, ' ');
      let arr = attr.split(' ');
      arr.forEach((include, i) => {
        if(!customElements.get(include)){
          return;
        }
        let el = document.createElement(include);
        let style = el.shadowRoot.querySelector('style');
        if(style) {
          obj.include = true;
          this.fetchRules(style, obj);
        }
        el = null;
      });
    }
    let arr = styleNode.textContent.match(/([^{]+{[^{]*})/g);
    if(arr && arr.length>0) {
      obj.rules = obj.rules.concat(arr);
    }
  }

  update(selector, rule, presenter) {

  }

  remove(selector) {

  }

  parseDo(rules, presenter) {
    let rslt = {'inject':false, 'stmt':''};
    rules.forEach((rule, i) => {
      let matches = rule.match(/(\s*\S+[:]{2}part\s*[(][^(]+[)])\s*{([^{]*)}/);
      if(matches && matches.length>2) {
        rslt.inject = true;
        let selector = matches[1].trim();
        let ss = selector.match(/(\S+)[:]{2}part.*/);
        let scope = ss[1];
        if(scope===':host') {
          selector = selector.replace(':host', presenter.localName);
        }
        document.beruangStyles = document.beruangStyles || [];
        if(document.beruangStyles.indexOf(selector)===-1) {
          let sheet = this.ensureDocSheet();
          this.addDocRule(sheet, selector, matches[2], 0);
          document.beruangStyles.push(selector);
        }
      } else {
          rslt.stmt += rule;
      }
    });
    return rslt;
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

export {BeruangStyleResolver};
