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

  _termedClones(templateNode, arrTemplateIdx, nodes,
    termedNodes, arrayTmplClones)
  {
    nodes.forEach((node, i) => {
      let arrayTemplate = this._arrayTemplate(node);
      if(arrayTemplate && arrayTemplate.node===templateNode
        && arrayTemplate.idx==arrTemplateIdx)
      {
        if(node.terms) {
          termedNodes.push(node);
          if( node.localName==='template' &&
            node.hasAttribute(this.constructor.stmtAttribute()) )
          {
            arrayTmplClones.push(node);
          }
        }
      }
      if(node.childNodes && node.childNodes.length>0) {
        this._termedClones(templateNode, arrTemplateIdx, node.childNodes,
          termedNodes, arrayTmplClones);
      }
    });
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

   let clones = [];
   let arrayTmplClones = [];
   idx = parseInt(idx, 10);
   this._termedClones(templateNode, idx, templateNode.clones,
     clones, arrayTmplClones);
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

  if(pathIdx<paths.length) {//recursive
     let cloneArr = [];
     arrayTmplClones.forEach((arrayClone, j) => {
       if(arrayClone.getAttribute(this.constructor.stmtAttribute())===spath) {
         let arr = this._substitutedClone(arrayClone, _val, paths, pathIdx);
         if( arr && arr.length>0 ) {
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

  push(prop, startIdx, count, arr, propNodeMap) {
    let clones = [];
    let nodes = propNodeMap[prop];
    if(!(nodes && nodes.length>0)){
      return;
    }
    nodes.forEach((node, i) => {
      if(!node.hasAttribute(this.constructor.stmtAttribute())){
        return;
      }
      for(let i=startIdx, stop=startIdx+count; i<stop; i++) {
        this._populate(node, i, clones);
      }
    });
    return clones;
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
      this.removeClones(node.clones, propNodeMap);
    }

    node.clones = [];
    val.forEach((item, i) => {
      this._populate(node, i, null);
    });
  }

  _populate(template, i, clones) {
    let clone = template.content.cloneNode(true);
    let cs = clone.childNodes;
    let count = cs ? cs.length : 0;
    template.parentNode.insertBefore(clone, template);
    let cloneArr = [];
    if(count>0) {
      let n = template.previousSibling;
      while(count>0 && n) {
        n.arrayTemplate = {'idx':i, 'node':template};
        if(clones) {
          clones.splice(0, 0, n);
        }
        count--;
        cloneArr.splice(0, 0, n);
        n = n.previousSibling;
      }
    }
    template.clones = template.clones.concat(cloneArr);
  }

  /*override parent abstract method*/
  static stmtAttribute() {
    return 'data-array';
  }

}

export {BeruangTemplateArray};
