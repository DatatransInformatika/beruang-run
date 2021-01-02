export const BeruangElementParser = (base) =>
class extends base {

  constructor() {
    super();
  }

  get elementParser() {
    return this;
  }

  _parseElement(node, presenter, propNodeMap, nodeParser) {
    let reProp = /[[]{2}\s{0,}\S{1,}[^[]{0,}\s{0,}]{2}/;
    for (let i=0, attrs=node.attributes, n=attrs.length; i<n; i++){
      let att = attrs[i].nodeName;
      let v = node.getAttribute(att);
      if(att.startsWith('on-')) {
        this._parseEvent(node, att.replace(/^on-/, ''), v, presenter._view);
      } else {
        if(reProp.test(v)){
          this._parseAttribute(att, v, node, presenter, propNodeMap, nodeParser);
        }
      }
    };
  }

  _solveElement(view, node, propNodeMap, nodeParser) {
    node.terms.forEach((term, i) => {
      let val = nodeParser._nodeValue(term, view);
      if(term.neg){
        val = !nodeParser._coercer.toBoolean(val);
      }
      if(term.property) {
        node[term.stmt] = val;
      } else {
        node.setAttribute(term.stmt, val);
      }
    });
  }

  _parseAttribute(attr, attrValue, node, presenter, propNodeMap, nodeParser) {
    attrValue = attrValue.replace(/^[[]{2}|]{2}$/g, '').trim();//remove brackets
    let vs = attrValue.split(':');
    let stmt = vs[0];
    let obj = nodeParser._tmplSimple(stmt, node, presenter, propNodeMap);
    if(obj) {//simple
      if(vs.length>1) {
        node.addEventListener(vs[1], ()=>{
          let arrPath = this._arrayPath(node, nodeParser);
          let path = arrPath ? arrPath : obj.term.paths[0];
          presenter.set(path, node.value);
        });
      }
    } else {
      obj = nodeParser._tmplFunc(stmt, node, presenter, propNodeMap);
    }
    if(obj) {
      let camel = this._camelize(attr);
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

  _parseEvent(node, event, fName, view) {
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

  _arrayPath(node, nodeParser) {
    let arrTmpl = nodeParser._arrayTemplate(node);
    if(!arrTmpl) {
      return null;
    }
    let path = node.terms[0].paths[0];
    return this._arrayPathDo(arrTmpl, path, nodeParser);
  }

  _arrayPathDo(arrTmpl, path, nodeParser) {
    if(!arrTmpl) {
      return path;
    }
    let rootPath = arrTmpl.node.terms[0].paths[0] + '.' + arrTmpl.idx;
    let item = arrTmpl.node.getAttribute('data-item') ;
    let paths = path.split('.');
    if( paths[0]===item ) {
      paths[0] = rootPath;
    }
    path = paths.join('.');
    let next = nodeParser._arrayTemplate(arrTmpl.node);
    return this._arrayPathDo(next, path, nodeParser);
  }

  _camelize(str) {
    return str.replace(/^([A-Z])|[\s-_]+(\w)/g,
      (match, p1, p2, offset) => p2 ? p2.toUpperCase() : p1.toLowerCase()
  	);
  }
}
