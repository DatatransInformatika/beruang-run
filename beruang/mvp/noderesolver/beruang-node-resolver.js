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

  pathExists(terms, path) {
    for(let i=0, len=terms.length; i<len ;i++){
      if(terms[i].paths.indexOf(path)>-1){
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

  _arrayValue(path, arrTmpl, view) {
    if(path===arrTmpl.node.tmpl.fldIdx) {
      return {'val':arrTmpl.idx};
    } else {
      let pathArr = path.split('.');
      if(pathArr[0]===arrTmpl.node.tmpl.fldItem) {
        let arr = this.nodeValue(arrTmpl.node.terms[0], view);
        let val = arr[arrTmpl.idx];
        for(let i=1;i<pathArr.length;i++) {
          val = val[pathArr[i]];
        }
        return {'val':val};
      }
    }
    return null;
  }

  _objPathValue(obj, pathArr) {
    for(let i=1, len=pathArr.length; obj!=null && i<len;i++) {
      if(obj.hasOwnProperty(pathArr[i])) {
        obj = obj[pathArr[i]];
      } else {
        return null;
      }
    }
    return obj;
  }

  tmplSimple(stmt, node, presenter, propNodeMap) {
    let path  = stmt.trim();

    let arrTmpl = this._arrayTemplate(node);
    if(arrTmpl){
      let obj = this._arrayValue(path, arrTmpl, presenter.view);
      if(obj) {
        let term = {
          'stmt':stmt,
          'fname':null,
          'neg':false,
          'args':[path],
          'paths':[path],
          'negs':[false],
          'vals':[obj.val]
        };
        return {'term':term, 'props':[]};
      }
    }

    let neg = path.substring(0,1)==='!';
    if(neg){
      path = path.substring(1).trim();
    }
    let pathArr = path.split('.');
    let p0 = pathArr[0];

    if(presenter.prop.hasOwnProperty(p0)) {
      let val = this._objPathValue(presenter[p0], pathArr);
      let term = {
        'stmt':stmt,
        'fname':null,
        'neg':neg,
        'args':[p0],
        'paths':[path],
        'negs':[neg],
        'vals':[val]
      };
      this._propNodeMap(propNodeMap, p0, node);
      return {'term':term, 'props':[p0]};
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

    let term = {
      'stmt':stmt,
      'fname':fname,
      'neg':neg,
      'args':[],
      'paths':[],
      'negs':[],
      'vals':[]};
    let props = [];
    let sarg = arr.length>2 ? arr[2] : null;
    if(sarg) {
      sarg.split(',').forEach((path, i) => {
        path = path.trim();
        if(path.length<1) {
          return;
        }

        let neg = path.substring(0,1)==='!';
        if(neg){
          path = path.substring(1).trim();
        }

        if(arrTmpl) {
          let obj = this._arrayValue(path, arrTmpl, presenter.view);
          if(obj) {
            term['args'].push(path);
            term['paths'].push(path),
            term['negs'].push(neg);
            term['vals'].push(obj.val);
            return;
          }
        }

        let pathArr = path.split('.');
        let p0 = pathArr[0];
        term['args'].push(p0);
        term['paths'].push(path);
        if(presenter.prop.hasOwnProperty(p0)) {
            let val = this._objPathValue(presenter[p0], pathArr);
            term['negs'].push(neg);
            term['vals'].push(val);
            this._propNodeMap(propNodeMap, p0, node);
            props.push(p0);
        } else {
            term['negs'].push(false);
            term['vals'].push(p0);
        }
      });
    }
    return {'term':term, 'props':props};
  }

  substitute(node, p, val, pathmatch) {
    let hit = false;
    node.terms.forEach((term, i) => {
      term.args.forEach((arg, j) => {
        if(arg!=p) {
          return;
        }
        let path = term.paths[j];
        if(pathmatch && pathmatch!=path) {
          return;
        }
        let _val = this._objPathValue(val, path.split('.'));
        if(term.negs[j]) {
          _val = !this.coercer.toBoolean(_val);
        }
        term.vals[j] = _val;
        hit = true;
      });
    });
    return hit;
  }

  pathSubstitute(node, path, val) {
    let hit = false;
    node.terms.forEach((term, i) => {
      let paths = path.split('.');
      let arg = paths[0];
      term.args.forEach((_arg, j) => {
        if(_arg!=arg) {
          return;
        }
        if(term.paths[j]==path) {
          let _val = this._objPathValue(val, path.split('.'));
          if(term.negs[j]) {
            _val = !this.coercer.toBoolean(_val);
          }
          term.vals[j] = _val;
          hit = true;
        }
      });
    });
    return hit;
/*      term.args.forEach((arg, j) => {
        if(arg!=p) {
          return;
        }
        let path = term.paths[j];
        if(pathmatch && pathmatch!=path) {
          return;
        }
        let _val = this._objPathValue(val, path.split('.'));
        if(term.negs[j]) {
          _val = !this.coercer.toBoolean(_val);
        }
        term.vals[j] = _val;
        hit = true;
      });
    });*/
    //return hit;
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
