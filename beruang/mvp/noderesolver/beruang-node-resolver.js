import {BeruangCoercer} from '../beruang-coercer.js';

export const BeruangNodeResolver = (base) =>
class extends base {
  constructor(){
    super();
  }

  get coercer() {
    if(!this._coercer){
      this._coercer = new BeruangCoercer();
    }
    return this._coercer;
  }

  termExists(terms, stmt) {
    for(let i=0, len=terms.length; i<len ;i++){
      if(terms[i].stmt===stmt) {
        return true;
      }
    }
    return false;
  }

  nodeValue(term, view) {
    let val = null;
    if(term.fname) {
      val = view[term.fname].apply(view, term.vals);
    } else {
      val = term.vals[0];
    }
    return val;
  }

  _arrayTemplate(node) {
    let tmplEl = node;
    while(tmplEl) {
      if(tmplEl.arrayTemplate){
        return tmplEl.arrayTemplate;
      }
      tmplEl = tmplEl.parentNode;
    }
    return null;
  }

  _arrayValue(prop, arrTmpl, view) {
    if(prop===arrTmpl.node.tmpl.fldIdx) {
      return {'val':arrTmpl.idx};
    } else {
      let arr = prop.split('.');
      if(arr[0]===arrTmpl.node.tmpl.fldItem) {
        let arrObj = this.nodeValue(arrTmpl.node.terms[0], view);
        let val = arrObj[arrTmpl.idx];
        for(let i=1;i<arr.length;i++) {
          val = val[arr[i]];
        }
        return {'val':val};
      }
    }
    return null;
  }

  tmplSimple(stmt, node, presenter, propNodeMap) {
    let prop  = stmt.trim();

    let arrTmpl = this._arrayTemplate(node);
    if(arrTmpl){
      let obj = this._arrayValue(prop, arrTmpl, presenter.view);
      if(obj) {
        let term = {'stmt':stmt, 'fname':null, 'args':[prop], 'negs':[false],
          'vals':[obj.val], 'neg':false};
        return {'term':term, 'props':[]};
      }
    }

    let neg = prop.substring(0,1)==='!';
    if(neg){
      prop = prop.substring(1).trim();
    }
    if(presenter.prop.hasOwnProperty(prop)) {
      let term = {'stmt':stmt, 'fname':null, 'args':[prop], 'negs':[neg],
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

    let arrTmpl = this._arrayTemplate(node);

    let fname = arr[1];
    let neg = fname.substring(0,1)==='!';
    if(neg){
      fname = fname.substring(1).trim();
    }

    let term = {'stmt':stmt, 'fname':fname, 'args':[], 'negs':[], 'vals':[],
      'neg':neg};
    let props = [];
    let sarg = arr.length>2 ? arr[2] : null;
    if(sarg) {
      sarg.split(',').forEach((arg, i) => {
        arg = arg.trim();
        if(arg.length>0) {
          let prop = arg;
          let neg = arg.substring(0,1)==='!';
          if(neg){
            prop = arg.substring(1).trim();
          }

          let handled = false;
          if(arrTmpl) {
            let obj = this._arrayValue(prop, arrTmpl, presenter.view);
            if(obj) {
              term['args'].push(prop);
              term['negs'].push(neg);
              term['vals'].push(obj.val);
              handled = true;
            }
          }

          if(!handled) {
            if(presenter.prop.hasOwnProperty(prop)) {
              term['args'].push(prop);
              term['negs'].push(neg);
              term['vals'].push(presenter[arg]);
              this._propNodeMap(propNodeMap, arg, node);
              props.push(arg);
            } else {
              term['args'].push(arg);
              term['negs'].push(false);
              term['vals'].push(arg);
            }
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
        if(term.negs[idx]) {
          val = !this.coercer.toBoolean(val);
        }
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
