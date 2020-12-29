import {BeruangTemplate} from './beruang-template.js';

class BeruangTemplateArray extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  /*override parent method*/
  parse(node, presenter, propNodeMap) {
    super.parse(node, presenter, propNodeMap);
    let item = node.getAttribute('data-tmpl-item') || 'item';
    item = item.trim();
    let idx = node.getAttribute('data-tmpl-index') || 'i';
    idx = idx.trim();
    node.tmpl = {'fldItem':item, 'fldIdx':idx};
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
      this._populate(node, i, node, node.clones.length, null);
    });
  }

  _termedClones(templateNode, equalFunc, nodes, termedNodes, arrayTmplClones)
  {
    nodes.forEach((node, i) => {
      let arrayTemplate = this._arrayTemplate(node);
      if(arrayTemplate && arrayTemplate.node===templateNode
        && equalFunc(node, arrayTemplate))
      {
        if(node.terms) {
          termedNodes.push(node);
          if(arrayTmplClones) {
            if( node.localName==='template' &&
              node.hasAttribute(this.constructor.stmtAttribute()) )
            {
              arrayTmplClones.push(node);
            }
          }
        }
      }
      if(node.childNodes && node.childNodes.length>0) {
        this._termedClones(templateNode, equalFunc, node.childNodes,
          termedNodes, arrayTmplClones);//recursive
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
   this._termedClones(
     templateNode, (node, arrayTemplate)=>arrayTemplate.idx==idx,
     templateNode.clones, clones, arrayTmplClones);
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

  push(prop, startIdx, count, propNodeMap) {
    let clones = [];
    let nodes = propNodeMap[prop];
    if(!(nodes && nodes.length>0)){
      return clones;
    }
    nodes.forEach((node, i) => {
      if(!node.hasAttribute(this.constructor.stmtAttribute())){
        return;
      }
      let obj = this._getFirstCloneIdx(node.clones, startIdx);
      let beforeNode = obj ? obj.clone : node;
      let spliceIndex = obj ? obj.arrayIndex : node.clones.length;
      for(let i=startIdx, stop=startIdx+count; i<stop; i++) {
        let c0 = node.clones.length;
        this._populate(node, i, beforeNode, spliceIndex, clones);
        let offset = node.clones.length -  c0;
        spliceIndex += offset;
        if(beforeNode!=node) {
          beforeNode = node.clones[spliceIndex];
        }
      }
    });
    return clones;
  }

  splice(prop, startIdx, insertCount, removeCount, propNodeMap) {
    let clones = [];
    let nodes = propNodeMap[prop];
    if(!(nodes && nodes.length>0)){
      return clones;
    }
    nodes.forEach((node, i) => {
      if(!node.hasAttribute(this.constructor.stmtAttribute())){
        return;
      }

      let nextClone = this._getFirstCloneIdx(node.clones,
        startIdx + (removeCount>0 ? 1 : 0));

    //removeFirst
      if(removeCount>0) {
        let idx = startIdx + removeCount - 1;
        for(; node.clones.length>0 && idx>=startIdx; idx--)
        {
          for(let j=node.clones.length-1; j>=0; j--) {
            let clone = node.clones[j];
            if(clone.arrayTemplate.idx==idx){
              this._removeClone(clone, propNodeMap);
              node.clones.splice(j, 1);
            }
          }
        }
      }

    //insert
      if(insertCount>0) {
        let obj = this._getFirstCloneIdx(node.clones, startIdx + removeCount);
        let beforeNode = obj ? obj.clone : node;
        let spliceIndex = obj ? obj.arrayIndex : node.clones.length;
        for(let i=startIdx, stop=startIdx+insertCount; i<stop; i++) {
          let c0 = node.clones.length;
          this._populate(node, i, beforeNode, spliceIndex, clones);
          let offset = node.clones.length -  c0;
          spliceIndex += offset;
          if(beforeNode!=node) {
            beforeNode = node.clones[spliceIndex];
          }
        }
      }

    //correct idx for shifted clones
      if( nextClone ) {
        let offset = insertCount - removeCount;
        if(offset!=0) {
          let clone = nextClone.clone;
          while(clone && clone.arrayTemplate && clone.arrayTemplate.node===node) {
            clone.arrayTemplate.idx += offset;
            if(clone.term) {
              this._removeTermByPath(clone, node.tmpl.fldIdx);
              clones.push(clone);
            }
            if(clone.childNodes && clone.childNodes.length>0) {
              this._termedClones(node,
                (_node, _arrayTemplate)=>{
                  let match = _arrayTemplate.idx==clone.arrayTemplate.idx;
                  if(match) {
                    this._removeTermByPath(_node, node.tmpl.fldIdx);
                  }
                  return match;
                },
                clone.childNodes, clones, null);
            }
            clone = clone.nextSibling;
          }
        }
      }
    });

    return clones;
  }

  _removeTermByPath(node, path) {
    for(let i=node.terms.length-1; i>=0; i--) {
      if( node.terms[i].paths.indexOf(path)>-1 ) {
        node.terms.splice(i, 1);
      }
    }
  }

  _getFirstCloneIdx(clones, index) {
    for(let i=0, len=clones.length; i<len; i++) {
      let n = clones[i];
      if(n.arrayTemplate.idx==index) {
        return {'clone':n, 'arrayIndex':i};
      }
    }
    return null;
  }

  _populate(template, i, beforeNode, spliceIndex, clones) {
    let clone = template.content.cloneNode(true);
    let count = clone.childNodes ? clone.childNodes.length : 0;
    if(count>0) {
      template.parentNode.insertBefore(clone, beforeNode);
      let n = beforeNode.previousSibling;
      while(count>0 && n) {
        n.arrayTemplate = {'idx':i, 'node':template};
        if(clones) {
          clones.splice(0, 0, n);
        }
        count--;
        template.clones.splice(spliceIndex, 0, n);
        n = n.previousSibling;
      }
    }
  }

  /*override parent abstract method*/
  static stmtAttribute() {
    return 'data-array';
  }

}

export {BeruangTemplateArray};
