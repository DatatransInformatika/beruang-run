import {BeruangNodeResolver} from './beruang-node-resolver.js';

class BeruangTextNode extends BeruangNodeResolver(Object) {

  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let hasRawContent = !!node.rawContent;
    let raw = hasRawContent ? node.rawContent : node.textContent;
    let gs = raw.match(/[[]{2}\s{0,}\S{1,}[^[]{0,}\s{0,}]{2}/g);
    if(!gs){
      return;
    }
    gs.forEach((g, i) => { /*[[...]]*/
      let stmt = g.replace(/^[[]{2}|]{2}$/g, '').trim();/*remove brackets*/
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
    });
    if(node.terms && !hasRawContent) {
      node.rawContent = node.textContent;
    }
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let s = node.rawContent;
    node.terms.forEach((term, i) => {
      let val = this.nodeValue(term, view);
      if(term.neg){
        val = !this.coercer.toBoolean(val);
      }
      if(val!=null) {
        s = s.replaceAll('[[' + term.stmt + ']]', val);
      }
    });
    node.textContent = s;
  }

}

export {BeruangTextNode};
