import {BeruangNodeResolver} from './beruang-node-resolver.js';

class BeruangTextNode extends BeruangNodeResolver(Object) {

  constructor() {
    super();
  }

  parse(node, props, presenter, propNodeMap) {
    let brackets = node.textContent.match(/[[]{2}\s{0,}\S{1,}\s{0,}[^[]{1,}]{2}/g);
    if(brackets){
      brackets.forEach((bracket, i) => { /*[[...]]*/
        let stmt = bracket.replace(/^[[]{2}|]{2}$/g, '').trim();/*remove brackets*/
        if(node.terms && this.termExists(node.terms, stmt)){
          return;
        }
        let term = this.tmplSimple(stmt, node, presenter, propNodeMap);
        if(!term) {
          term = this.tmplFunc(stmt, node, presenter, propNodeMap);
        }
        if(term!=null) {
          if(!node.terms) {
            node.terms = [];
          }
          node.terms.push(term);
        }
      });
      if(node.terms) {
        node.rawContent = node.textContent;
      }
    }
  }

  solve(view, node) {
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
