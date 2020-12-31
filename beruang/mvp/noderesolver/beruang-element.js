import {BeruangNodeResolver} from './beruang-node-resolver.js';

class BeruangElement extends BeruangNodeResolver(Object) {

  constructor() {
    super();
  }

  /*override parent abstract method*/
  parse(node, presenter, propNodeMap) {
    let re = /[[]{2}\s{0,}\S{1,}[^[]{0,}\s{0,}]{2}/;
    for (let i=0, attrs=node.attributes, n=attrs.length; i<n; i++){
      let att = attrs[i].nodeName;
      let v = node.getAttribute(att);
      if(re.test(v)){
        v = v.replace(/^[[]{2}|]{2}$/g, '').trim();//remove brackets
        let vs = v.split(':');
        let stmt = vs[0];
        let obj = this.tmplSimple(stmt, node, presenter, propNodeMap);
        if(obj) {//simple
          if(vs.length>1) {
            node.addEventListener(vs[1], ()=>{
              let arrPath = this.arrayPath(node);
              let path = arrPath ? arrPath : obj.term.paths[0];
              presenter.set(path, node.value);
            });
          }
        } else {
          obj = this.tmplFunc(stmt, node, presenter, propNodeMap);
        }
        if(obj) {
          let camel = this.camelize(att);
          obj.term.property = presenter.hasOwnProperty(camel);
          obj.term.stmt = obj.term.property ? camel : att;
          if(!node.terms) {
            node.terms = [];
            node.props = [];
          }
          node.terms.push(obj.term);
          node.props = node.props.concat(obj.props);
        }
      }
    }
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    node.terms.forEach((term, i) => {
      let val = this.nodeValue(term, view);
      if(term.neg){
        val = !this.coercer.toBoolean(val);
      }
      if(term.property) {
        node[term.stmt] = val;
      } else {
        node.setAttribute(term.stmt, val);
      }
    });
  }

}

export {BeruangElement};
