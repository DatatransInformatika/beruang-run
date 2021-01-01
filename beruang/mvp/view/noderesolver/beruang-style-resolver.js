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

  update(node, selector, stmt, dedup, presenter) {
    selector = this.trimSelector(selector);
    let parted = this.partScope(selector);
    if(parted) {//do not update ::part(...)
      return;
    }
    let hit = false;
    for(let i=node.rules.length-1; i>=0; i--) {
      let rule = node.rules[i];
      let terms = this.ruleSplit(rule);
      let _selector = terms[1].trim();
      if(_selector===selector) {
        if(hit) {//dedup
          node.rules.splice(i, 1);
        } else {
          hit = true;
          node.rules[i] = selector + ' {' + stmt + '}';
          if(!dedup) {
            break;
          }
        }
      }
    }
    if(!hit) {
      node.rules.push(selector + ' {' + stmt + '}');
    }
    let rslt = this.parseDo(node.rules, presenter);
    node.textContent = rslt.stmt;
  }

  remove(node, selector, presenter) {
    let hit = false;
    selector = this.trimSelector(selector);
    for(let i=node.rules.length-1; i>=0; i--) {
      let rule = node.rules[i];
      let terms = this.ruleSplit(rule);
      let _selector = terms[1].trim();
      let parted = this.partScope(_selector);
      if(!parted && _selector===selector) {//can delete ::part(...) selector
        node.rules.splice(i, 1);
        hit = true;
      }
    }
    if(hit) {
      let rslt = this.parseDo(node.rules, presenter);
      node.textContent = rslt.stmt;
    }
  }

  parseDo(rules, presenter) {
    let rslt = {'inject':false, 'stmt':''};
    rules.forEach((rule, i) => {
      let terms = this.ruleSplit(rule);
      let selector = this.trimSelector(terms[1]);
      let stmt = terms[2];
      rule = selector + ' {' + stmt + '}';
      rules[i] = rule;//update with trimmed version
      let parted = this.partScope(selector);
      if(parted) {
        document.beruangStyles = document.beruangStyles || [];
        if(document.beruangStyles.indexOf(selector)===-1) {
          let scope = parted[1];
          if(scope===':host') {
            selector = selector.replace(':host', presenter.localName);
          }
          let sheet = this.ensureDocSheet();
          this.addDocRule(sheet, selector, stmt, 0);
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

  trimSelector(s) {
    return s.trim().replace(/[ ]+/g, ' ');
  }

  ruleSplit(s) {
    return s.match(/([^{]+){([^{]*)}/);
  }

  partScope(s) {
    return s.match(/(\S+)[:]{2}part.*/);
  }
}

export {BeruangStyleResolver};
