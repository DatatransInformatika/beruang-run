export const BeruangElementParser = (base) =>
class extends base {

  constructor() {
    super();
  }

  get elementParser() {
    return this;
  }

  parseElement(node, presenter, propNodeMap, nodeParser) {
    let reProp = /[[]{2}\s{0,}\S{1,}[^[]{0,}\s{0,}]{2}/;
    for (let i=0, attrs=node.attributes, n=attrs.length; i<n; i++){
      let att = attrs[i].nodeName;
      let v = node.getAttribute(att);
      if(att.startsWith('on-')) {
        this.parseEvent(node, att.replace(/^on-/, ''), v, presenter.view);
      } else {
        if(reProp.test(v)){
          this.parseAttribute(att, v, node, presenter, propNodeMap, nodeParser);
        }
      }
    };
  }

  solveElement(view, node, propNodeMap, nodeParser) {
    node.terms.forEach((term, i) => {
      let val = nodeParser.nodeValue(term, view);
      if(term.neg){
        val = !nodeParser.coercer.toBoolean(val);
      }
      if(term.property) {
        node[term.stmt] = val;
      } else {
        node.setAttribute(term.stmt, val);
      }
    });
  }

  parseAttribute(attr, attrValue, node, presenter, propNodeMap, nodeParser) {
    attrValue = attrValue.replace(/^[[]{2}|]{2}$/g, '').trim();//remove brackets
    let vs = attrValue.split(':');
    let stmt = vs[0];
    let obj = nodeParser.tmplSimple(stmt, node, presenter, propNodeMap);
    if(obj) {//simple
      if(vs.length>1) {
        node.addEventListener(vs[1], ()=>{
          let arrPath = nodeParser.arrayPath(node);
          let path = arrPath ? arrPath : obj.term.paths[0];
          presenter.set(path, node.value);
        });
      }
    } else {
      obj = nodeParser.tmplFunc(stmt, node, presenter, propNodeMap);
    }
    if(obj) {
      let camel = nodeParser.camelize(attr);
      obj.term.property = node.hasOwnProperty(camel);
      obj.term.stmt = obj.term.property ? camel : attr;
      if(!node.terms) {
        node.terms = [];
        node.props = [];
      }
      node.terms.push(obj.term);
      node.props = node.props.concat(obj.props);
    }
  }

  parseEvent(node, event, fName, view) {
    if(event==='hit') {
      if( 'ontouchstart' in node ) {
        node.addEventListener('touchstart', view[fName]);
      } else if( 'onclick' in node ) {
        node.addEventListener('click', view[fName]);
      }
    } else {
      node.addEventListener(event, view[fName]);
    }
  }
}
