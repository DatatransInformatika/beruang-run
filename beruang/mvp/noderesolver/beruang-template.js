import {BeruangNodeResolver} from './beruang-node-resolver.js';

export const BeruangTemplate = (base) =>
class extends BeruangNodeResolver(base) {
  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let attr = this.stmtAttribute();
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

//abstract:BEGIN
  stmtAttribute() {
    throw new Error('BeruangTemplate: you have to call stmtAttribute method ' +
      'implemented by child only!');
  }
//abstract:END
}
