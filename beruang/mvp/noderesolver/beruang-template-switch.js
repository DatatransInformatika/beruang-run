import {BeruangTemplate} from './beruang-template.js';

class BeruangTemplateSwitch extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let term = node.terms[0];
    let val = this.nodeValue(term, view);
    let show = this.coercer.toBoolean(val);
    if(term.neg) {
      show = !show;
    }
    if(show) {
      let clone = node.content.cloneNode(true);
      let cs = clone.childNodes;
      let count = cs ? cs.length : 0;
      node.parentNode.insertBefore(clone, node);
      node.clones = [];
      if(count>0) {
        let el = node.previousSibling;
        while(count>0 && el) {
          count--;
          node.clones.splice(0, 0, el);
          el = el.previousSibling;
        }
      }
    } else {
      if(node.clones) {
        node.clones.forEach((clone, i) => {
          this._removePropNode(clone, propNodeMap);
          clone.parentNode.removeChild(clone);
        });
        node.clones = null;
      }
    }
  }

  _removePropNode(node, propNodeMap) {
    if(node.props) {
      node.props.forEach((prop, i) => {
        let arr = propNodeMap[prop];
        if(arr){
          let idx = arr.indexOf(node);
          if(idx>-1){
            propNodeMap[prop].splice(idx, 1);
          }
        }
      });
    }
    let el = node.firstChild;
    while(el) {
      this._removePropNode(el, propNodeMap);
      el = el.nextSibling;
    }
  }

  /*override parent abstract method*/
  stmtAttribute() {
    return 'data-tmpl-switch';
  }
}

export {BeruangTemplateSwitch};
