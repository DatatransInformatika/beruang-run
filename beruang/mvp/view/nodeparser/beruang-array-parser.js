export const BeruangArrayParser = (base) =>
class extends base {
  constructor() {
    super();
  }

  get _arrayParser() {
    return this;
  }

  _parseArray(node, presenter, propNodeMap, nodeParser, templateParser,
    templateAttr)
  {
    templateParser._parseTemplate(node, presenter, propNodeMap, nodeParser,
      templateAttr);
    let item = node.getAttribute('data-item') || 'item';
    item = item.trim();
    let idx = node.getAttribute('data-index') || 'i';
    idx = idx.trim();
    node.tmpl = {'fldItem':item, 'fldIdx':idx};
  }

  _solveArray(view, node, propNodeMap, nodeParser, templateParser) {
    let term = node.terms[0];
    let val = nodeParser._nodeValue(term, view);
    if(val==null) {
      return;
    }
    if(val.constructor.name!=='Array'){
      val = nodeParser._coercer.toArray(val);
    }

    if(node.clones) {
      templateParser._removeClones(node.clones, propNodeMap);
    }

    node.clones = [];
    val.forEach((item, i) => {
      this._populate(node, i, node, node.clones.length, null);
    });
  }

  _splice(nodes, startIdx, insertCount, removeCount, propNodeMap, nodeParser,
    templateParser, templateAttr)
  {
    let ret = {'clones':[], 'substitutes': []};
    nodes.forEach((node, i) => {
      if(!node.hasAttribute(templateAttr)){
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
              templateParser._removeClone(clone, propNodeMap);
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
            if(clone.term && nodeParser._pathSubstitute(clone, fldIdx, newIdx)) {
              ret.substitutes.push(clone);
            }
            if(clone.childNodes && clone.childNodes.length>0) {
              this._termedClones(node,
                (_node, arrTmpl)=>{
                  return nodeParser._pathSubstitute(_node, fldIdx, newIdx);
                }, clone.childNodes, ret.substitutes, null, nodeParser);
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

  _termedClones(templateNode, equalFunc, nodes, termedNodes, arrayTmplClones,
    nodeParser)
  {
    nodes.forEach((node, i) => {
      let arrayTemplate = nodeParser._arrayTemplate(node);
      if(arrayTemplate && arrayTemplate.node===templateNode
        && equalFunc(node, arrayTemplate))
      {
        if(node.terms) {
          termedNodes.push(node);
          if(arrayTmplClones) {
            if( node.localName==='template' &&
              node.hasAttribute(this.templateAttribute()) )
            {
              arrayTmplClones.push(node);
            }
          }
        }
      }
      if(node.childNodes && node.childNodes.length>0) {
        this._termedClones(templateNode, equalFunc, node.childNodes,
          termedNodes, arrayTmplClones, nodeParser);//recursive
      }
    });
  }
}
