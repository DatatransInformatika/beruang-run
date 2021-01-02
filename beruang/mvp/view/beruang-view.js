import {BeruangNodeParser} from './nodeparser/beruang-node-parser.js';
import {BeruangTemplateParser} from './nodeparser/beruang-template-parser.js';

export const BeruangView = (base) =>
class extends base {

  constructor() {
    super();
    this.propNodeMap = {};
  }

  set presenter(p) {
    this._presenter = p;
  }

  get presenter() {
    return this._presenter;
  }

  set propNodeMap(obj) {
    this._propNodeMap = obj;
  }

  get propNodeMap() {
    return this._propNodeMap;
  }

  get nodeParser() {
    if(!this._nodeParser) {
      this._nodeParser = new BeruangNodeParser();
    }
    return this._nodeParser;
  }

  get templateParser() {
    if(!this._templateParser) {
      this._templateParser = new BeruangTemplateParser();
    }
    return this._templateParser;
  }

  parseTemplate(root, nodes) {
    root.childNodes.forEach((node, i) => {
      this.parseNode(node, nodes);
    });
  }

  parseNode(node, nodes) {
    if(node.nodeType===3/*Text*/) {
      if(this.textParser) {
        this.textParser.parseText(node, this.presenter, this.propNodeMap,
          this.nodeParser);
      }
    } else if(node.nodeType==1/*Element*/) {
      if(node.localName==='style') {
        if(this.styleParser) {
          this.styleParser.parseStyle(node, this.presenter);
          this.styleNode = node;
          nodes.push(node);
        }
      } else if(node.localName==='template') {
        if( node.hasAttribute(this.switchAttribute) ) {
          if(this.switchParser) {
            this.switchParser.parseSwitch(node, this.presenter,
              this.propNodeMap, this.nodeParser, this.templateParser,
              this.switchAttribute);
          }
        } else if( node.hasAttribute(this.arrayAttribute) ) {
          if(this.arrayParser) {
            this.arrayParser.parseArray(node, this.presenter, this.propNodeMap,
              this.nodeParser, this.templateParser, this.arrayAttribute);
          }
        }
      } else {
        if(this.elementParser) {
          this.elementParser.parseElement(node, this.presenter,
            this.propNodeMap, this.nodeParser);
        }
        this.parseTemplate(node, nodes);//recursive
      }
    }
    if(node.terms) {
      nodes.push(node);
    }
  }

  updateNode(props) {
    let rslt = [];
    props.forEach((path, i) => {
      let obj = this.pathNodes( path, (node)=>true );
      if(obj.finalNodes.length>0) {
        obj.finalNodes.forEach((node, i) => {
          let substitute = false;
          if(node.nodeType===3/*Text*/) {
            substitute = !!this.textParser;
          } else if(node.nodeType==1/*Element*/) {
            if(node.localName==='template') {
              if( node.hasAttribute(this.switchAttribute) ) {
                substitute = !!this.switchParser;
              } else if( node.hasAttribute(this.arrayAttribute) ) {
                substitute = !!this.arrayParser;
              }
            } else {
              if(node.localName!='style') {
                substitute = !!this.elementParser;
              }
            }
          }
          if(substitute) {
            let val = this.presenter.get(path);
            if(this.nodeParser.pathSubstitute(node, obj.finalPath, val)){
                rslt.push(node);
            }
          }
        });

        if(obj.pathNodes>0) {
          rslt = rslt.concat(obj.pathNodes);
        }
      }//if(obj.finalNodes.length>0) {
    });//props.forEach((path, i) => {
    if(rslt.length>0) {
        this.solveNode(rslt);
    }
  }

  solveNode(nodes) {
    let clones = [];
    nodes.forEach((node, i) => {
      if(node.nodeType===3/*Text*/) {
        if(this.textParser) {
          this.textParser.solveText(this, node, this.propNodeMap,
            this.nodeParser);
        }
      } else if(node.nodeType==1/*Element*/) {
        if(node.localName==='template') {
          if( node.hasAttribute(this.switchAttribute) ) {
            if(this.switchParser) {
              this.switchParser.solveSwitch(this, node, this.propNodeMap,
                this.nodeParser, this.templateParser);
            }
          } else if( node.hasAttribute(this.arrayAttribute) ) {
            if(this.arrayParser) {
              this.arrayParser.solveArray(this, node, this.propNodeMap,
                this.nodeParser, this.templateParser);
            }
          }
          if(node.clones) {
            clones = clones.concat(node.clones);
          }
        } else {
          if(node.localName!='style') {
            if(this.elementParser) {
              this.elementParser.solveElement(this, node, this.propNodeMap,
                this.nodeParser);
            }
          }
        }
      }
    });
    this.solveClones(clones);
  }

  arraySplice(path, startIdx, count, removeCount) {
    if(this.arrayParser) {
      let obj = this.pathNodes( path, (node)=>node.hasAttribute &&
        node.hasAttribute(this.arrayAttribute) );
      if(obj.finalNodes.length>0) {
        let rslt = this.arrayParser.splice(obj.finalNodes, startIdx, count,
          removeCount, this.propNodeMap, this.nodeParser, this.templateParser,
          this.arrayAttribute);
        if(rslt.substitutes.length>0) {
          obj.pathNodes = obj.pathNodes.concat(rslt.substitutes);
        }
        this.solveClones(rslt.clones);
        if(obj.pathNodes.length>0) {
          this.solveNode(obj.pathNodes);
        }
      }
    }
  }

  updateStyle(selector, rule, dedup) {
    if(this.styleNode && this.styleParser) {
      this.styleParser.updateStyle(this.styleNode, selector, rule, dedup, this.presenter);
    }
  }

  removeStyle(selector) {
    if(this.styleNode && this.styleParser) {
      this.style.removeStyle(this.styleNode, selector, this.presenter);
    }
  }

  solveClones(clones) {
    if(clones.length>0) {
      let nodes = [];
      clones.forEach((clone, i) => {
        let ns = [];
        this.parseNode(clone, ns);
        nodes = nodes.concat(ns);
      });
      this.solveNode(nodes);
    }
  }

  pathNodes(path, finalMatchFunc) {
    let paths = path.split('.');
    let result = {'pathNodes':[], 'finalNodes':[], 'finalPath':paths[0]};
    this.pathNodesDo(paths, 1, this.propNodeMap[paths[0]], finalMatchFunc, result);
    return result;
  }

  pathNodesDo(paths, startIdx, nodes, finalMatchFunc, result)
  {
    if(!(nodes && nodes.length>0)){
      return;
    }

    let arrIdx = -1;
    for(; startIdx<paths.length; startIdx++) {
      let s = paths[startIdx];
      if( isNaN(s) ) {
        result.finalPath += '.' + s;
      } else {
        arrIdx = parseInt(s, 10);
        break;
      }
    }

    nodes.forEach((node, i) => {
      if(node.hasAttribute && node.hasAttribute(this.arrayAttribute)) {
        if(this.arrayParser) {
          let attr = node.getAttribute ? node.getAttribute(this.arrayAttribute)
            : null;
          if( attr && attr==result.finalPath ) {
            if(startIdx >= paths.length) {
              if( finalMatchFunc(node) )
                result.finalNodes.push(node);
              else
                result.pathNodes.push(node);
              return;
            }
            let nexts = [];
            this.arrayParser.termedClones(node,
              (_node, arrTmpl)=>arrTmpl.idx==arrIdx,
              node.clones, nexts, null, this.nodeParser);
            result.finalPath = node.tmpl.fldItem;
            this.pathNodesDo(paths, startIdx+1, nexts, finalMatchFunc, result);
          }
        }
      } else {
        if(startIdx==1 && startIdx>=paths.length) {
          if( finalMatchFunc(node) )
            result.finalNodes.push(node);
          else
            result.pathNodes.push(node);
          return;
        }
        if(node.terms && this.nodeParser.pathExists(node.terms, result.finalPath)){
          if(startIdx >= paths.length && finalMatchFunc(node) ) {
            result.finalNodes.push(node);
          } else {
            result.pathNodes.push(node);
          }
        }
      }
    });
  }

  get switchAttribute() {
    return 'data-switch';
  }

  get arrayAttribute() {
    return 'data-array';
  }

//abstract:BEGIN
  static getTemplate() {
    throw new Error('BeruangView: you have to call getTemplate method ' +
      'implemented by child only!');
  }
//abstract:END
}
