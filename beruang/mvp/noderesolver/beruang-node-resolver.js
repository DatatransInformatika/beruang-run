export const BeruangNodeResolver = (base) =>
class extends base {
  constructor(){
    super();
  }

  termExists(terms, stmt) {
    for(let i=0, len=terms.length; i<len ;i++){
      if(terms[i].stmt===stmt) {
        return true;
      }
    }
    return false;
  }

  tmplSimple(stmt, node, ctx, propNodeMap) {
    stmt = stmt.trim();
    if(ctx.hasOwnProperty(stmt)) {
      let term = {'stmt':stmt, 'fname':null, 'args':[stmt], 'vals':[ctx[stmt]]};
      this._propNodeMap(propNodeMap, stmt, node);
      return term;
    }
    return null;
  }

  tmplFunc(stmt, node, ctx, propNodeMap) {
    let arr = stmt.match(/(\S+)\((.*)\)$/); /*get function name and arguments*/
    if(!arr || arr.length<2) {
      return null;
    }
    let term = {'stmt':stmt, 'fname':arr[1], 'args':[], 'vals':[]};
    let sarg = arr.length>2 ? arr[2] : null;
    if(sarg) {
      sarg.split(',').forEach((arg, i) => {
        arg = arg.trim();
        if(arg.length>0) {
            term['args'].push(arg);
            if(ctx.hasOwnProperty(arg)) {
              term['vals'].push(ctx[arg]);
              this._propNodeMap(propNodeMap, arg, node);
            } else {
              term['vals'].push(arg);
            }
        }
      });
    }
    return term;
  }

  substitute(node, p, val) {
    node.terms.forEach((term, i) => {
      let idx = term.args.indexOf(p);
      if(idx > -1) {
        term.vals[idx] = val;
      }
    });
  }

  _propNodeMap(map, prop, node) {
    let arr = map[prop] || [];
    if(arr.indexOf(node)==-1){
      arr.push(node);
      map[prop] = arr;
    }
  }
}
