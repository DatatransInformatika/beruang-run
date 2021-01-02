class BeruangTemplateParser {

  constructor() {}

  _parseTemplate(node, presenter, propNodeMap, nodeParser, tmplAttr) {
    let stmt = node.getAttribute(tmplAttr) || '';
    stmt = stmt.toString();
    if(stmt.length<1){
      return;
    }
    let obj = nodeParser._tmplSimple(stmt, node, presenter, propNodeMap)
      || nodeParser._tmplFunc(stmt, node, presenter, propNodeMap);
    if(obj) {
      if(!node.terms) {
        node.terms = [];
        node.props = [];
      }
      node.terms.push(obj.term);
      node.props = node.props.concat(obj.props);
    }
  }

  _removePropNode(node, propNodeMap) {
    if(node.props) {
      node.props.forEach((prop, i) => {
        let arr = propNodeMap[prop];
        if(arr){
          let idx = arr.indexOf(node);
          if(idx>-1){
            propNodeMap[prop].splice(idx, 1);
          }
        }
      });
    }
    let el = node.firstChild;
    while(el) {
      this._removePropNode(el, propNodeMap);//recursive
      el = el.nextSibling;
    }
  }

  _removeClones(clones, propNodeMap) {
    clones.forEach((clone, i) => {
      this._removeClone(clone, propNodeMap);
    });
  }

  _removeClone(clone, propNodeMap) {
    this._removePropNode(clone, propNodeMap);
    clone.parentNode.removeChild(clone);
    if(clone.clones) {
      this._removeClones(clone.clones, propNodeMap);//recursive
      clone.clones = null;
    };
  }
}

export {BeruangTemplateParser};
