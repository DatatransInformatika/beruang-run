import {BeruangNodeResolver} from './beruang-node-resolver.js';

class BeruangTextNode extends BeruangNodeResolver(Object) {

  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let gs = node.textContent.match(/[[]{2}\s{0,}\S{1,}\s{0,}[^[]{1,}]{2}/g);
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
    if(node.terms) {
      node.rawContent = node.textContent;
    }
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let s = node.rawContent;
    node.terms.forEach((term, i) => {
      let val = null;
      if(term.fname) {
        val = view[term.fname].apply(view, term.vals);
      } else {
        val = term.vals[0];
      }
      if(val!=null) {
        s = s.replaceAll('[[' + term.stmt + ']]', val);
      }
    });
    node.textContent = s;
  }

}

export {BeruangTextNode};
