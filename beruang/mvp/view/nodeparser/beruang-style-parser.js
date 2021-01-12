export const BeruangStyleParser = (base) =>
class extends base {

  constructor() {
    super();
  }

  get _styleParser() {
    return this;
  }

  _parseStyle(node, presenter) {
    let obj = {
      'css':[],
      'stmt':''};
    let styles = [];
    this._mergeStyle(node, styles);
    if(styles.length>0){
      node.textContent = styles.join('');
      node.removeAttribute('include');
    }
    this._fetchRules(node, obj, presenter);
    node['css'] = obj['css'];
    if(obj.stmt.length>0) {
      node.textContent = obj.stmt;
    }
  }

  _mergeStyle(node, styles) {
    let inc = node.getAttribute('include');
    if(!inc) {
      return;
    }
    styles.splice(0, 0, node.textContent);
    inc = inc.trim().replace(/[ ]+/g, ' ');
    let arr = inc.split(' ');
    arr.forEach((include, i) => {
      if(!customElements.get(include)){
        return;
      }
      let el = document.createElement(include);
      let style = el.shadowRoot.querySelector('style');
      if(style) {
        styles.splice(0, 0, style.textContent);
        this._mergeStyle(style, styles);
      }
    });
  }

  _fetchRules(styleNode, obj, presenter) {
    let s = styleNode.textContent;
    s = this._removeComment(s);
    let rules = this._ruleSplit(s);
    rules.forEach((rule, i) => {
      // (selector) => (item contents without bracket)
      let ms = rule.match(/([^}{]+){((?:.|\n)+)}/);
      if(!ms) {
        return null;
      }
      let selector = this._trimSelector(ms[1]);
      let ret = this._ruleToObj(selector, ms[2], presenter, true);
      if(ret) {
        obj.css.push(ret.ruleObj);
        if(ret.styleStmt) {
          obj.stmt += ret.styleStmt;
        }
      }
    });
  }

  _ruleToObj(selector, property, presenter, initial) {
    //split property, aware of mixins
    let props = property.match(/(([^}{;]+;)|([^}{]+{[^}{]+});?)/g);
    if(!props) {
      return null;
    }

    let ruleObj = {'selector':selector, 'props':[]};

    let parted = this._partScope(selector);
    if(parted) {
      ruleObj.props.push(property);
      this._parted(ruleObj, presenter, parted[1]);
      return {'ruleObj':ruleObj};
    }

    let openStmt = selector + ' {';
    let styleStmt = initial ? openStmt : null;

    props.forEach((prop, j) => {
      let ps = this._splitSelectorProp(prop);
      if(ps) {
        ruleObj.props.push(prop);
        if(styleStmt) {
          styleStmt += prop;
        }
      } else {
        let key = this._applyKey(prop);
        if(key) {
          ruleObj.props.push(prop);
          if(initial) {
            styleStmt += this._mixinSubstitute(presenter, key);
          }
        }
      }
    });

    if(styleStmt) {
      if(styleStmt===openStmt) {
        styleStmt = null;
      } else {
        styleStmt += '}\n';
      }
    }

    return {'ruleObj':ruleObj, 'styleStmt':styleStmt};
  }

  _updateStyle(node, selector, stmt, dedup, presenter) {
    //do not update :host
    //since mixins is inside :host so no mixins update
    if( selector.match(/^\s*:host\s*([(].*[)])*\s*$/) ) {
      return;
    }
    //do not update or insert new ::parted
    selector = this._trimSelector(selector);
    if( this._partScope(selector) ){
      return;
    }

    let ret = this._ruleToObj(selector, stmt, presenter, false);
    if(!ret){
      return;
    }

    let hit = false;
    for(let i=node.css.length-1; i>=0; i--) {
      if(node.css[i].selector===selector) {
        if(hit) {//dedup
          node.css.splice(i, 1);
        } else {
          hit = true;
          node.css[i] = ret.ruleObj;
          if(!dedup) {
            break;
          }
        }
      }
    }
    if(!hit) {
      node.css.push(ret.ruleObj);
    }
    this._redraw(presenter, node);
  }

  _removeStyle(node, selector, presenter) {
    //do not remove :host
    if( selector.match(/^\s*:host\s*([(].*[)])*\s*$/) ) {
      return;
    }
    //do not remove ::parted
    selector = this._trimSelector(selector);
    if( this._partScope(selector) ){
      return;
    }

    let hit = false;
    for(let i=node.css.length-1; i>=0; i--) {
      if(node.css[i].selector===selector) {
        node.css.splice(i, 1);
        hit = true;
      }
    }
    if(hit) {
      this._redraw(presenter, node);
    }
  }

  _redraw(presenter, node) {
    let stmt = '';
    node.css.forEach((rule, i) => {
      if( this._partScope(rule.selector) ) {//do not update parted
        return;
      }
      let openStmt = rule.selector + ' {';
      let _stmt = openStmt;
      rule.props.forEach((prop, j) => {
        let ps = this._splitSelectorProp(prop);
        if(ps) {
          _stmt += prop;
        } else {
          let key = this._applyKey(prop);
          if(key) {
            _stmt += this._mixinSubstitute(presenter, key);
          }
        }
      });
      if(_stmt!=openStmt) {
          _stmt += '}\n';
          stmt += _stmt;
      }
    });
    node.textContent = stmt;
  }

  _parted(ruleObj, presenter, scope) {
    document.beruangStyles = document.beruangStyles || [];
    if(document.beruangStyles.indexOf(ruleObj.selector)===-1) {
      if(!scope) {
        let parted = this._partScope(ruleObj.selector);
        scope = parted[1];
      }
      let selector = ruleObj.selector;
      if(scope===':host') {
        selector = selector.replace(':host', presenter.localName);
      }
      let sheet = this._ensureDocSheet();
      this._addDocRule(sheet, selector, ruleObj.props[0], 0);
      document.beruangStyles.push(selector);
    }
  }

  _ensureDocSheet() {
    let css = document.styleSheets;
    if(css.length==0) {
      let style = document.createElement("style");
      style.appendChild(document.createTextNode(""));//WebKit need this
      document.head.appendChild(style);
      css = document.styleSheets;
    }
    return css[css.length-1];
  }

  _addDocRule(sheet, selector, rules, index) {
    if("insertRule" in sheet) {
      sheet.insertRule(selector + "{" + rules + "}", index);
    } else if("addRule" in sheet) {
      sheet.addRule(selector, rules, index);
    }
  }

  _mixinSubstitute(presenter, key) {
    let s = this._mixinSubstituteDo(presenter, key);
    if(!s) {
      return '';
    }
    let ps = s.match(/[^;]+;/g);
    s = '';
    ps.forEach((p, i) => {
      let mixinKey = this._applyKey(p);
      if(mixinKey) {
        let t = this._mixinSubstituteDo(presenter, mixinKey);
        if(t) {
          s += t;
        }
      } else {
        s += p;
      }
    });
    return s;
  }

  _mixinSubstituteDo(presenter, key) {
    let style = window.getComputedStyle(presenter);
    if(!style) {
      return null;
    }
    let s = style.getPropertyValue(key);
    if(s) {
        s = this._removeBracket(s);
    }
    return s;
  }

  _removeComment(s) {
    return s.replace(/\/\*(.|\n)*?\*\//g, '');
  }

  _ruleSplit(s) {
    return s.match(/[^}{]+{(?:[^}{]+|{(?:[^}{]+|{[^}{]*}[;]?)*})*}/g);
  }

  _removeBracket(s) {
    return s.replace(/^\s*{|}\s*$/g, '');
  }

  _trimSelector(s) {
    return s.trim().replace(/[ ]+/g, ' ');
  }

  _partScope(s) {
    return s.match(/(\S+)[:]{2}part.*/);
  }

  _splitSelectorProp(s) {
    return s.match(/(.+):((?:.|\n)+);?/);
  }

  _applyKey(s) {
    let m = s.match(/(?:@apply\s*)(.+)/);
    return m ? this._removeSemiColon(m[1].trim()) : null;
  }

  _removeSemiColon(s) {
    return s.replace(/;$/, '');
  }

}
