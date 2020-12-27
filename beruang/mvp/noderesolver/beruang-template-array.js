import {BeruangTemplate} from './beruang-template.js';

class BeruangTemplateArray extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  parse(node, presenter, propNodeMap) {
    super.parse(node, presenter, propNodeMap);
    let item = node.getAttribute('data-tmpl-item') || 'item';
    item = item.trim();
    let idx = node.getAttribute('data-tmpl-index') || 'i';
    idx = idx.trim();
    node.tmpl = {'fldItem':item, 'fldIdx':idx};
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let term = node.terms[0];
    let val = this.nodeValue(term, view);
    if(val==null) {
      return;
    }
    if(val.constructor.name!=='Array'){
      val = this.coercer.toArray(val);
    }
    node.clones = [];
    val.forEach((item, i) => {
      let clone = node.content.cloneNode(true);
      let cs = clone.childNodes;
      let count = cs ? cs.length : 0;
      node.parentNode.insertBefore(clone, node);
      let cloneArr = [];
      if(count>0) {
        let el = node.previousSibling;
        while(count>0 && el) {
          el.arrayTemplate = {'idx':i, 'node':node};
          count--;
          cloneArr.splice(0, 0, el);
          el = el.previousSibling;
        }
      }
      node.clones = node.clones.concat(cloneArr);
    });
  }

  /*override parent abstract method*/
  stmtAttribute() {
    return 'data-tmpl-array';
  }

}

export {BeruangTemplateArray};
