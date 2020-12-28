import {BeruangNodeResolver} from './beruang-node-resolver.js';

export const BeruangTemplate = (base) =>
class extends BeruangNodeResolver(base) {
  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let attr = this.constructor.stmtAttribute();
    let stmt = node.getAttribute(attr) || '';
    stmt = stmt.toString();
    if(stmt.length<1){
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

  removePropNode(node, propNodeMap) {
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
      this.removePropNode(el, propNodeMap);
      el = el.nextSibling;
    }
  }

  removeClones(clones, propNodeMap) {
    clones.forEach((clone, i) => {
      this.removePropNode(clone, propNodeMap);
      clone.parentNode.removeChild(clone);
      if(clone.clones) {
        this.removeClones(clone.clones, propNodeMap);
        clone.clones = null;
      }
    });
  }

//abstract:BEGIN
  static stmtAttribute() {
    throw new Error('BeruangTemplate: you have to call stmtAttribute method ' +
      'implemented by child only!');
  }
//abstract:END
}
