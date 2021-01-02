import {BeruangCoercer} from '../../../util/beruang-coercer.js';

class BeruangNodeParser {

  constructor(){}

  get _coercer() {
    if(!this.__coercer){
      this.__coercer = new BeruangCoercer();
    }
    return this.__coercer;
  }

  _nodeValue(term, view) {
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
        let arr = this._nodeValue(arrTmpl.node.terms[0], view);
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

  _tmplSimple(stmt, node, presenter, propNodeMap) {
    let path  = stmt.trim();

    let arrTmpl = this._arrayTemplate(node);
    if(arrTmpl){
      let obj = this._arrayValue(path, arrTmpl, presenter._view);
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

    if(presenter._prop.hasOwnProperty(p0)) {
      let val = this._objPathValue(presenter[p0], pathArr);
      if(neg) {
        val = !this._coercer.toBoolean(val);
      }
      let term = {
        'stmt':stmt,
        'fname':null,
        'neg':false,
        'args':[p0],
        'paths':[path],
        'negs':[neg],
        'vals':[val]
      };
      this._propNodeMapInsert(propNodeMap, p0, node);
      return {'term':term, 'props':[p0]};
    }
    return null;
  }

  _tmplFunc(stmt, node, presenter, propNodeMap) {
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
          let obj = this._arrayValue(path, arrTmpl, presenter._view);
          if(neg) {
            obj.val = !this._coercer.toBoolean(obj.val);
          }
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
        if(presenter._prop.hasOwnProperty(p0)) {
            let val = this._objPathValue(presenter[p0], pathArr);
            if(neg) {
              val = !this._coercer.toBoolean(val);
            }
            term['negs'].push(neg);
            term['vals'].push(val);
            this._propNodeMapInsert(propNodeMap, p0, node);
            props.push(p0);
        } else {
            term['negs'].push(false);
            term['vals'].push(p0);
        }
      });
    }
    return {'term':term, 'props':props};
  }

  _pathSubstitute(node, path, val) {
    let hit = false;
    node.terms.forEach((term, i) => {
      term.paths.forEach((_path, j) => {
        if(_path==path) {
          let _val = val;
          if(term.negs[j]) {
            _val = !this._coercer.toBoolean(_val);
          }
          term.vals[j] = _val;
          hit = true;
        }
      });
    });
    return hit;
  }

  _propNodeMapInsert(map, prop, node) {
    let arr = map[prop] || [];
    if(arr.indexOf(node)==-1){
      arr.push(node);
      map[prop] = arr;
    }
  }

}

export {BeruangNodeParser};
