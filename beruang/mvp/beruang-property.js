import {BeruangCoercer} from './beruang-coercer.js';
import {BeruangArray} from './beruang-array.js';

export const BeruangProperty = (base) =>
class extends BeruangArray(base) {
  constructor() {
    super();
    this.prop = {};
  }

  get prop() {
    return this._prop;
  }

  set prop(obj) {
    this._prop = obj;
  }

  get(path) {
    let objFld = this.getObjField(path);
    if(!objFld) {
      return null;
    }
    return objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
  }

  set(path, val) {
    let objFld = this.getObjField(path);
    if(objFld) {
      let oldVal = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
      if(val!=oldVal) {
        if(objFld.fld) {
          objFld.obj[objFld.fld] = val;
          this.view.updateNode([path]);
        } else {
          this[objFld.prop] = val;
        }
      }
    }
  }

  get coercer() {
    if(!this._coercer) {
      this._coercer = new BeruangCoercer();
    }
    return this._coercer;
  }

  setProperty(props) {
    for (let [p, v] of Object.entries(props)) {
      if(this.hasOwnProperty(p)) {
        continue;
      }

      let validType = v.type===Boolean || v.type===String || v.type===Number
        || v.type===Date
        || v.type===Object || v.type===Array;

      if(validType) {
        Object.defineProperty(this, p,
          { get:this.getter(p, v.type),
            set:this.setter(p, v.type, v.observer, v.reflectToAttribute)
          });

        let _v;

        let attr = this.toAttribute(p);
        if( this.hasAttribute(attr) ) {
            _v = this.getAttribute(attr);
        } else {
            if(typeof v.value === 'function') {
              _v = v.value();
            } else {
              _v = v.value;
            }
        }

        this[p] = this.coercer.coerce(v.type, _v);
      }
    }
  }

  getter(p, vt) {
    return ()=>{
      return this.prop[p];
    };
  }

  setter(p, vt, observer, reflectToAttr) {
    return (val)=>{
      if(val===undefined) {
        val = null;
      }

      let old = this[p];
      this.prop[p] = val;
      val = this[p];

      if(val===old) {
          return;
      }

      if(this.view) {
        this.delayedUpdateNode(p);
      }

      if(observer){
        this[observer].apply(this, [val, old]);
      }

      if(reflectToAttr) {
        let attr = this.toAttribute(p);
        if(vt===Boolean) {
          if(val){
            this.setAttribute(attr, '');
          } else {
            this.removeAttribute(attr);
          }
        } else {
          val = this.coercer.coerce(String, val);
          this.setAttribute(attr, val==null ? '' : val);
        }
      }
    };
  }

  toAttribute(s) {
    return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  }

  delayedUpdateNode(prop) {
    this._updatedProps = this._updatedProps || [];
    if(this._updatedProps.indexOf(prop)>-1){
      return;
    }
    this._updatedProps.push(prop);
    if(this._updateNodeXval) {
      clearTimeout(this._updateNodeXval);
    }
    this._updateNodeXval = setTimeout(
      ()=>{
          this.view.updateNode(this._updatedProps);
          this._updateNodeXval = null;
          this._updatedProps = null;
      }, 50);
  }

  getObjField(path) {
    let arr = path.split('.');
    let p0 = arr[0];
    let propKeys = Object.keys(this.prop);
    if(propKeys.indexOf(p0)==-1){
      return null;
    }
    let obj = this[p0];
    let lastIdx = arr.length - 1;
    for(let i=1; obj!=undefined && obj!=null & i<lastIdx; i++) {
      if(obj.hasOwnProperty(arr[i])) {
        obj = obj[arr[i]];
      } else {
        obj = null;
      }
    }
    if(obj===undefined || obj===null) {
      return null;
    }
    let fld = lastIdx>0 ? arr[lastIdx] : null;
    if(fld && !obj.hasOwnProperty(fld)) {
      return null;
    }
    return {'prop':p0, 'obj':obj, 'fld':fld};
  }
}
