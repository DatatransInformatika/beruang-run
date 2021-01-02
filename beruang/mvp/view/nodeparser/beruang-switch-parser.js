export const BeruangSwitchParser = (base) =>
class extends base {
  constructor() {
    super();
  }

  get _switchParser() {
    return this;
  }

  _parseSwitch(node, presenter, propNodeMap, nodeParser, templateParser,
    templateAttr)
  {
    templateParser._parseTemplate(node, presenter, propNodeMap, nodeParser,
      templateAttr);
  }

  _solveSwitch(view, node, propNodeMap, nodeParser, templateParser) {
    let term = node.terms[0];
    let val = nodeParser._nodeValue(term, view);
    let show = nodeParser._coercer.toBoolean(val);
    if(term.neg) {
      show = !show;
    }
    if(show) {
      let clone = node.content.cloneNode(true);
      let cs = clone.childNodes;
      let count = cs ? cs.length : 0;
      node.parentNode.insertBefore(clone, node);
      node.clones = [];
      if(count>0) {
        let el = node.previousSibling;
        while(count>0 && el) {
          count--;
          node.clones.splice(0, 0, el);
          el = el.previousSibling;
        }
      }
    } else {
      if(node.clones) {
        templateParser._removeClones(node.clones, propNodeMap);
        node.clones = null;
      }
    }
  }
}
