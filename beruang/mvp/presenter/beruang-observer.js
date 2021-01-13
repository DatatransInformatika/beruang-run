export const BeruangObserver = (base) =>
class extends base {
  constructor() {
    super();
    this._obs = [];
  }

  _setObserver(obss) {
    obss.forEach((obs, i) => {
      let m = obs.match(/([^)(]+)[(]([^)(]+)[)]/);
      let funcObj = {};
      funcObj.fname = m[1].trim();
      funcObj.fargs = [];
      let args = m[2].split(',');
      args.forEach((arg, i) => {
        funcObj.fargs.push(arg.trim());
      });
      this._obs.push(funcObj);
    });
  }

  _multiObserver(p) {
    for(let i=0, len = this._obs.length; i<len; i++) {
      let funcObj = this._obs[i];
      if(funcObj.fargs.indexOf(p)>-1) {
        if( this[funcObj.fname] ) {
          let args = [];
          funcObj.fargs.forEach((arg, i) => {
            args.push(this[arg]);
          });
          this[funcObj.fname].apply(this, args);
        }
      }
    }
  }
}
