import {BeruangElement} from '../../beruang-element.js'

class BeruangIcon extends BeruangElement {

  static get properties() {
    return {
      icon: {
        type:String,
        value:'',
        observer:'_nameChanged'
      }
    }
  }

  static get template() { return `<style>
    :host {
      display:inline-block;
      fill:currentcolor;
      stroke:none;
    }`; }

  static get observers() {
    return ['_iconChanged(connected, icon)'];
  }

  _iconChanged(connected, icon) {
    if(!connected) {
      return;
    }
    if(this._iconset) {
      this._iconset.removeIcon(this);
    }
    let parts = (icon || '').split(':');
    let iconName = parts.pop();
    let iconSetName = parts.pop();
    this._iconset = window.iconset[iconSetName];
    if(this._iconset) {
      this._iconset.createIcon(this, iconName);
    } else {
      let timeout = 1000;
      let x = setInterval(()=>{
        this._iconset = window.iconset[iconSetName];
        if(timeout<=0 || this._iconset) {
          if(this._iconset) {
            this._iconset.createIcon(this, iconName);
          }
          clearInterval(x);
        } else {
          timeout -= 100;
        }
      }, 100);
    }
  }
}

window.customElements.define('beruang-icon', BeruangIcon);
