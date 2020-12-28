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

  _termedClones(templateNode, node, nodes, arrayTmplClones) {
    if(node.terms) {
      nodes.push(node);
      if( node.localName==='template' &&
        node.hasAttribute(this.constructor.stmtAttribute()) )
      {
        arrayTmplClones.push(node);
      }
    }
    let n = node.firstChild;
    while(n) {
      let arrayTemplate = this._arrayTemplate(n);
      if( arrayTemplate && arrayTemplate.node===templateNode ) {
        if(n.terms) {
          nodes.push(n);
        }
        if( n.localName==='template' ) {
          if( n.hasAttribute(this.constructor.stmtAttribute()) ) {
            arrayTmplClones.push(n);
          }
        } else {
          this._termedClones(templateNode, n, nodes, arrayTmplClones);
        }
      }
      n = n.nextSibling;
    }
  }

 _substitutedClone(templateNode, val, paths, startPathIdx) {
   let pathIdx = startPathIdx;
   if( paths.length < (pathIdx+1) ) {
     return null;
   }
   let idx = paths[pathIdx];//must be array index
   if(isNaN(idx)) {
     return null;
   }
   let cloneNodes = templateNode.clones;
   let clones = [];
   let arrayTmplClones = [];
   idx = parseInt(idx, 10);
   cloneNodes.forEach((node, i) => {
     if(node.arrayTemplate && node.arrayTemplate.idx==idx){
       this._termedClones(templateNode, node, clones, arrayTmplClones);
     }
   });
   if(clones.length==0) {
     return null;
   }
   let spath = templateNode.tmpl.fldItem;/*rootPath*/
   let _val = val[idx];
   if(!_val) {
     return null;
   }

   pathIdx++;
   for(; pathIdx<paths.length; pathIdx++) {
     let field = paths[pathIdx];
     if(!isNaN(field)) {
       if( !(_val && _val.constructor.name==='Array') ) {
         return null;
       }
       break;
     } else {
       spath = spath + '.' + field;
       if(!_val.hasOwnProperty(field)){
         return null;
       }
       _val = _val[field];
     }
   }
   if(spath==templateNode.tmpl.fldItem) {
     return null;
   } else if(pathIdx<paths.length) {//recursive
     let cloneArr = [];
     arrayTmplClones.forEach((arrayClone, j) => {
       if(arrayClone.getAttribute(this.constructor.stmtAttribute())===spath) {
         let arr = this._substitutedClone(arrayClone, _val, paths, pathIdx);
         if( arr && arr.length>1 ) {
           cloneArr = cloneArr.concat(arr);
         }
       }
     });
     return cloneArr;
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
        let paths = pathmatch.split('.');
        obj.clones = this._substitutedClone(node, val, paths, 1);
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
  static stmtAttribute() {
    return 'data-tmpl-array';
  }

}

export {BeruangTemplateArray};
