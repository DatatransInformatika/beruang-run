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

  tmplSimple(stmt, node, presenter, propNodeMap) {
    stmt = stmt.trim();
    if(presenter.prop.hasOwnProperty(stmt)) {
      let term = {'stmt':stmt, 'fname':null, 'args':[stmt],
        'vals':[presenter[stmt]]};
      this._propNodeMap(propNodeMap, stmt, node);
      return {'term':term, 'props':[stmt]};
    }
    return null;
  }

  tmplFunc(stmt, node, presenter, propNodeMap) {
    let arr = stmt.match(/(\S+)\s*\((.*)\)$/);/*function name and arguments*/
    if(!arr || arr.length<2) {
      return null;
    }
    let term = {'stmt':stmt, 'fname':arr[1], 'args':[], 'vals':[]};
    let props = [];
    let sarg = arr.length>2 ? arr[2] : null;
    if(sarg) {
      sarg.split(',').forEach((arg, i) => {
        arg = arg.trim();
        if(arg.length>0) {
            term['args'].push(arg);
            if(presenter.prop.hasOwnProperty(arg)) {
              term['vals'].push(presenter[arg]);
              this._propNodeMap(propNodeMap, arg, node);
              props.push(arg);
            } else {
              term['vals'].push(arg);
            }
        }
      });
    }
    return {'term':term, 'props':props};
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

//abstract:BEGIN
  parse(node, presenter, propNodeMap) {
    throw new Error('BeruangNodeResolver: you have to call parse method ' +
      'implemented by child only!');
  }

  solve(view, node, propNodeMap) {
    throw new Error('BeruangNodeResolver: you have to call solve method ' +
      'implemented by child only!');
  }
//abstract:END
}
