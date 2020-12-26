import {BeruangCoercer} from './beruang-coercer.js';

export const BeruangProperty = (base) =>
class extends base {
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
          { get:this._getter(p, v.type),
            set:this._setter(p, v.type, v.observer, v.reflectToAttribute)
          });
        this[p] = v.value;
      }
    }
  }

  _getter(p, vt) {
    return ()=>{
      let val = this.prop[p];
      if( typeof val==='function' ){
        val = val ? val() : null;
        val = this.coercer.coerce(vt, val);
      }
      return val;
    };
  }

  _setter(p, vt, observer, reflectToAttr) {
    return (val)=>{
      if(val===undefined) {
        val = null;
      }

      let old = observer ? this[p] : null;
      this.prop[p] = val;
      val = (observer || reflectToAttr) ? this[p] : null;

      if(this.view) {
        this._delayedUpdateNode(p);
      }

      if(observer && val!=old) {
        this[observer].apply(this, [val, old]);
      }

      if(reflectToAttr) {
        let attr = p.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
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

  _delayedUpdateNode(prop) {
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
          this.view.updateNode(this._updatedProps, []);
          this._updateNodeXval = null;
          this._updatedProps = null;
      }, 50);
  }
}
