import {BeruangTemplate} from './beruang-template.js';

class BeruangTemplateArray extends BeruangTemplate(Object) {
  constructor() {
    super();
  }

  /*override parent method*/
  parse(node, presenter, propNodeMap) {
    super.parse(node, presenter, propNodeMap);
    let item = node.getAttribute('data-item') || 'item';
    item = item.trim();
    let idx = node.getAttribute('data-index') || 'i';
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

  _getArrayTemplatesByPath(rootPath, paths, startIdx, nodes, templates) {
    if(!(nodes && nodes.length>0)){
        return;
    }
    nodes.forEach((node, i) => {
      let arrayAttr = node.getAttribute(this.constructor.stmtAttribute());
      if(!arrayAttr) {
        if(node.childNodes && node.childNodes.length>0){
          this._getArrayTemplatesByPath(rootPath, paths, startIdx,
            node.childNodes, templates);//recursive
        }
        return;
      }

      let pathLen = paths.length();
      if(pathLen<=startIdx){
        if(rootPath==arrayAttr) {
          templates.push(node);
        }
        return;
      }

      //rootPath = node.getAttribute('data-item');//update rootPath

      for(let i=startIdx; i<pathLen; i++) {
        if(!isNaN(paths[i])) {
          rootPath = node.getAttribute('data-item');//update rootPath
        }
      }

      //let idx = paths[startIdx];
      //if( isNaN(idx) ) {
        //return;
      //}


      //rootPath =



    });
  }

  push(path, prop, startIdx, count, propNodeMap) {
    /*
    let templates = [];
    let paths = path.split(.);
    this._getArrayTemplatesByPath(paths[0], paths, 1, propNodeMap[prop], templates);
    if(templates.length==0){
      return [];
    }*/

    let clones = [];


  //get array template nodes by prop path
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

  splice(path, prop, startIdx, insertCount, removeCount, propNodeMap) {
    let nodes = propNodeMap[prop];
    if(!(nodes && nodes.length>0)){
      return null;
    }

    let ret = {'clones':[], 'substitutes': []};

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
          this._populate(node, i, beforeNode, spliceIndex, ret.clones);
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
          while(clone && clone.arrayTemplate
            && clone.arrayTemplate.node===node)
          {
            let newIdx = clone.arrayTemplate.idx + offset;
            let fldIdx = node.tmpl.fldIdx;
            clone.arrayTemplate.idx = newIdx;
            if(clone.term) {
              this.substitute(clone, fldIdx, newIdx, fldIdx);
              ret.substitutes.push(clone);
            }
            if(clone.childNodes && clone.childNodes.length>0) {
              this._termedClones(node,
                (_node, _arrayTemplate)=>{
                  this.substitute(_node, fldIdx, newIdx, fldIdx);
                  return true;
                },
                clone.childNodes, ret.substitutes, null);
            }
            clone = clone.nextSibling;
          }
        }
      }
    });

    return ret;
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
      templateNode.clones, clones, arrayTmplClones
    );
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

  /*override parent abstract method*/
  static stmtAttribute() {
    return 'data-array';
  }

}

export {BeruangTemplateArray};
