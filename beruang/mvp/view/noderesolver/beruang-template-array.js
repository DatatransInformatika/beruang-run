import {BeruangTemplateResolver} from './beruang-template-resolver.js';

class BeruangTemplateArray extends BeruangTemplateResolver(Object) {
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
      this.populate(node, i, node, node.clones.length, null);
    });
  }

  splice(nodes, startIdx, insertCount, removeCount, propNodeMap) {
    let ret = {'clones':[], 'substitutes': []};
    nodes.forEach((node, i) => {
      if(!node.hasAttribute(this.stmtAttribute())){
        return;
      }

      let nextClone = this.getFirstCloneIdx(node.clones,
        startIdx + (removeCount>0 ? 1 : 0));

    //removeFirst
      if(removeCount>0) {
        let idx = startIdx + removeCount - 1;
        for(; node.clones.length>0 && idx>=startIdx; idx--)
        {
          for(let j=node.clones.length-1; j>=0; j--) {
            let clone = node.clones[j];
            if(clone.arrayTemplate.idx==idx){
              this.removeClone(clone, propNodeMap);
              node.clones.splice(j, 1);
            }
          }
        }
      }

    //insert
      if(insertCount>0) {
        let obj = this.getFirstCloneIdx(node.clones, startIdx + removeCount);
        let beforeNode = obj ? obj.clone : node;
        let spliceIndex = obj ? obj.arrayIndex : node.clones.length;
        for(let i=startIdx, stop=startIdx+insertCount; i<stop; i++) {
          let c0 = node.clones.length;
          this.populate(node, i, beforeNode, spliceIndex, ret.clones);
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
              this.pathSubstitute(clone, fldIdx, newIdx);
              ret.substitutes.push(clone);
            }
            if(clone.childNodes && clone.childNodes.length>0) {
              this.termedClones(node,
                (_node, arrTmpl)=>{
                  return this.pathSubstitute(_node, fldIdx, newIdx);
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

  getFirstCloneIdx(clones, index) {
    for(let i=0, len=clones.length; i<len; i++) {
      let n = clones[i];
      if(n.arrayTemplate.idx==index) {
        return {'clone':n, 'arrayIndex':i};
      }
    }
    return null;
  }

  populate(template, i, beforeNode, spliceIndex, clones) {
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

  termedClones(templateNode, equalFunc, nodes, termedNodes, arrayTmplClones)
  {
    nodes.forEach((node, i) => {
      let arrayTemplate = this.arrayTemplate(node);
      if(arrayTemplate && arrayTemplate.node===templateNode
        && equalFunc(node, arrayTemplate))
      {
        if(node.terms) {
          termedNodes.push(node);
          if(arrayTmplClones) {
            if( node.localName==='template' &&
              node.hasAttribute(this.stmtAttribute()) )
            {
              arrayTmplClones.push(node);
            }
          }
        }
      }
      if(node.childNodes && node.childNodes.length>0) {
        this.termedClones(templateNode, equalFunc, node.childNodes,
          termedNodes, arrayTmplClones);//recursive
      }
    });
  }

  /*override parent abstract method*/
  stmtAttribute() {
    return 'data-array';
  }

}

export {BeruangTemplateArray};
