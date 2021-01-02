export const BeruangTextParser = (base) =>
class extends base {

  constructor() {
    super();
  }

  get _textParser() {
    return this;
  }

  _parseText(node, presenter, propNodeMap, nodeParser) {
    let gs = node.textContent.match(/[[]{2}\s{0,}\S{1,}[^[]{0,}\s{0,}]{2}/g);
    if(!gs){
      return;
    }
    gs.forEach((g, i) => { /*[[...]]*/
      let stmt = g.replace(/^[[]{2}|]{2}$/g, '').trim();/*remove brackets*/
      if(node.terms && this._termExists(node.terms, stmt)){
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
    });
    if(node.terms) {
      node.rawContent = node.textContent;
    }
  }

  _solveText(view, node, propNodeMap, nodeParser) {
    let s = node.rawContent;
    node.terms.forEach((term, i) => {
      let val = nodeParser._nodeValue(term, view);
      if(term.neg){
        val = !nodeParser._coercer.toBoolean(val);
      }
      if(val!=null) {
        s = s.replaceAll('[[' + term.stmt + ']]', val);
      }
    });
    node.textContent = s;
  }

  _termExists(terms, stmt) {
    for(let i=0, len=terms.length; i<len ;i++){
      if(terms[i].stmt===stmt) {
        return true;
      }
    }
    return false;
  }

}
