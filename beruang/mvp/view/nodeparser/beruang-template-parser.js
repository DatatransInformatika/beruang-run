class BeruangTemplateParser {

  constructor() {}

  parseTemplate(node, presenter, propNodeMap, nodeParser, tmplAttr) {
    let stmt = node.getAttribute(tmplAttr) || '';
    stmt = stmt.toString();
    if(stmt.length<1){
      return;
    }
    let obj = nodeParser.tmplSimple(stmt, node, presenter, propNodeMap)
      || nodeParser.tmplFunc(stmt, node, presenter, propNodeMap);
    if(obj) {
      if(!node.terms) {
        node.terms = [];
        node.props = [];
      }
      node.terms.push(obj.term);
      node.props = node.props.concat(obj.props);
    }
  }

  removePropNode(node, propNodeMap) {
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
      this.removePropNode(el, propNodeMap);//recursive
      el = el.nextSibling;
    }
  }

  removeClones(clones, propNodeMap) {
    clones.forEach((clone, i) => {
      this.removeClone(clone, propNodeMap);
    });
  }

  removeClone(clone, propNodeMap) {
    this.removePropNode(clone, propNodeMap);
    clone.parentNode.removeChild(clone);
    if(clone.clones) {
      this.removeClones(clone.clones, propNodeMap);//recursive
      clone.clones = null;
    };
  }
}

export {BeruangTemplateParser};
