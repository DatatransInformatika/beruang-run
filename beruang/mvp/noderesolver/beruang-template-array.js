import {BeruangTemplate} from './beruang-template.js';

class BeruangTemplateArray extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  parse(node, presenter, propNodeMap) {
    super.parse(node, presenter, propNodeMap);
    let item = node.getAttribute('data-tmpl-item') || 'item';
    item = item.trim();
    let idx = node.getAttribute('data-tmpl-index') || 'i';
    idx = idx.trim();
    node.tmpl = {'fldItem':item, 'fldIdx':idx};
  }

  _termedClones(node, nodes) {
    if(node.terms) {
      nodes.push(node);
    }
    let n = node.firstChild;
    while(n) {
      if(n.terms) {
        nodes.push(n);
      }
      if(n.localName!=='template') {
        this._termedClones(n, nodes);
      }
      n = n.nextSibling;
    }
  }

 _substitutedClone(rootPath, childNodes, val, pathmatch) {//recursive
   let paths = pathmatch.split('.');
   if(paths.length<2) {
     return null;
   }
   let idx = paths[1];//must be array index
   if(isNaN(idx)) {
     return null;
   }
   let clones = [];
   idx = parseInt(idx, 10);
   childNodes.forEach((node, i) => {
     if(node.arrayTemplate && node.arrayTemplate.idx==idx){
       this._termedClones(node, clones);
     }
   });
   if(clones.length==0) {
     return null;
   }
   let spath = rootPath;
   let _val = val[idx];
   if(!_val) {
     return null;
   }
   for(let i=2, len=paths.length; i<len; i++) {
     let field = paths[i];
     if(!isNaN(field)) {
       break;
     } else {
       spath = spath + '.' + field;
       if(!_val.hasOwnProperty(field)){
         return null;
       }
       _val = _val[field];
     }
   }
   if(spath==rootPath) {
     return null;
   } else {
     let cloneArr = [];
     clones.forEach((clone, i) => {
       for(let j=0, len=clone.terms.length; j<len; j++){
         let term = clone.terms[j];
         if( term.paths.indexOf(spath) > -1 ){
           this.substitute(clone, spath, val[idx], spath);
           cloneArr.push(clone);
           break;
         }
       }
     });
     return cloneArr;
   }
   return null;
 }

  arraySubstitute(node, p, val, pathmatch) {
    let obj = {'clones':null, 'hit':false};
    if(pathmatch && p!=pathmatch) {
      if(node.clones && node.clones.length>0) {
        obj.clones = this._substitutedClone(
          node.tmpl.fldItem, //rootPath
          node.clones, val,
          pathmatch);
      }
    } else {
      obj.hit = super.substitute(node, p, val, pathmatch);
    }
    return obj;
  }

  /*override parent abstract method*/
  solve(view, node, propNodeMap) {
    let term = node.terms[0];
    let val = this.nodeValue(term, view);
    if(val==null) {
      return;
    }
    if(val.constructor.name!=='Array'){
      val = this.coercer.toArray(val);
    }

    if(node.clones) {
      node.clones.forEach((clone, i) => {
        this.removePropNode(clone, propNodeMap);
        clone.parentNode.removeChild(clone);
      });
      node.clones = null;
    }

    node.clones = [];
    val.forEach((item, i) => {
      let clone = node.content.cloneNode(true);
      let cs = clone.childNodes;
      let count = cs ? cs.length : 0;
      node.parentNode.insertBefore(clone, node);
      let cloneArr = [];
      if(count>0) {
        let el = node.previousSibling;
        while(count>0 && el) {
          el.arrayTemplate = {'idx':i, 'node':node};
          count--;
          cloneArr.splice(0, 0, el);
          el = el.previousSibling;
        }
      }
      node.clones = node.clones.concat(cloneArr);
    });
  }

  /*override parent abstract method*/
  stmtAttribute() {
    return 'data-tmpl-array';
  }

}

export {BeruangTemplateArray};
