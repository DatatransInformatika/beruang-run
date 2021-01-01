import {BeruangTemplateResolver} from './beruang-template-resolver.js';

class BeruangTemplateSwitch extends BeruangTemplateResolver(Object) {
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
        this.removeClones(node.clones, propNodeMap);
        node.clones = null;
      }
    }
  }

  /*override parent abstract method*/
  stmtAttribute() {
    return 'data-switch';
  }
}

export {BeruangTemplateSwitch};