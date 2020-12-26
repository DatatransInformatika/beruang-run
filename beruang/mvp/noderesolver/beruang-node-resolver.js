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
    let prop  = stmt.trim();
    let neg = prop.substring(0,1)==='!';
    if(neg){
      prop = prop.substring(1).trim();
    }
    if(presenter.prop.hasOwnProperty(prop)) {
      let term = {'stmt':stmt, 'fname':null, 'args':[prop],
        'vals':[presenter[prop]], 'neg':neg};
      this._propNodeMap(propNodeMap, prop, node);
      return {'term':term, 'props':[prop]};
    }
    return null;
  }

  tmplFunc(stmt, node, presenter, propNodeMap) {
    let arr = stmt.match(/(\S+)\s*\((.*)\)$/);/*function name and arguments*/
    if(!arr || arr.length<2) {
      return null;
    }

    let fname = arr[1];
    let neg = fname.substring(0,1)==='!';
    if(neg){
      fname = fname.substring(1).trim();
    }

    let term = {'stmt':stmt, 'fname':fname, 'args':[], 'vals':[], 'neg':neg};
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
