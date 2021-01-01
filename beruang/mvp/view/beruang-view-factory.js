export const BeruangViewFactory = (base) =>
class extends base {

  static _viewClass = {};
  static _viewTmpl = {};
  static _viewWait = {};

  static createView(templateCallback) {
    let clsName = this.getViewClsName();
    let vc = this._viewClass[clsName];
    if(vc) {
      let t = this._viewTmpl[clsName];
      templateCallback(vc, t);
    } else if(this._viewWait[clsName]) {
      let xval = setInterval(()=>{
        if(!this._viewWait[clsName]){
          clearInterval(xval);
          vc = this._viewClass[clsName];
          let t = this._viewTmpl[clsName];
          templateCallback(vc, t);
        }
      }, 100);
    } else {
      this._viewWait[clsName] = true;
      let js = this.getViewJs(window.formfactor);
      import(js).then((module) => {
        vc = module[clsName];
        this._viewClass[clsName] = vc;
        let t = document.createElement('template');
        t.innerHTML = vc.template;
        this._viewTmpl[clsName] = t;
        templateCallback(vc, t);
        delete this._viewWait[clsName];
      });
    }
  }

//abstract:BEGIN
  static getViewClsName() {
    throw new Error('BeruangViewFactory: you have to call '
      + 'getViewClsName method implemented by child only!');
  }

  static getViewJs(formfactor) {
    throw new Error('BeruangViewFactory: you have to call '
      + 'getViewJs method implemented by child only!');
  }
//abstract:END
}
