import {BeruangTemplate} from './beruang-template.js';
import {BeruangCoercer} from '../beruang-coercer.js';

class BeruangTemplateSwitch extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let stmt = node.getAttribute('data-tmpl-switch') || '';
    stmt = stmt.toString();
    if(stmt.length<1){
      return;
    }
    if(node.terms && this.termExists(node.terms, stmt)){
      return;
    }
    let obj = this.tmplSimple(stmt, node, presenter, propNodeMap)
      || this.tmplFunc(stmt, node, presenter, propNodeMap);
    if(obj) {
      if(!node.terms) {
        node.terms = [];
        node.props = [];
      }
      node.terms.push(obj.term);
      node.props = node.props.concat(obj.props);
    }
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let term = node.terms[0];
    let val = null;
    if(term.fname) {
      val = view[term.fname].apply(view, term.vals);
    } else {
      val = term.vals[0];
    }
    let coercer = new BeruangCoercer();
    let show = coercer._toBoolean(val);
    coercer = null;
    if(show) {
      let sibling = node.previousElementSibling;
      let clone = node.content.cloneNode(true);
      node.parentNode.insertBefore(clone, node);
      node.clones = [];
      let elstart = sibling ? sibling.nextElementSibling
        : node.parentNode.firstElementChild;
      let elrun = elstart;
      while( elrun && elrun!==node ) {
        node.clones.push(elrun);
        elrun = elrun.nextElementSibling;
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
        if(arr ){
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
}

export {BeruangTemplateSwitch};
