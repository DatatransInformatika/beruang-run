(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {

--layout-fit: {
  position:absolute;
  top:0px;
  right:0px;
  bottom:0px;
  left:0px;
};

--layout-flex: {
  display:-ms-flexbox;
  display:-webkit-flex;
  display:flex;
};

--layout-row: {
  @apply --layout-flex;
  -ms-flex-direction:row;
  -webkit-flex-direction:row;
  flex-direction:row;
};

--layout-column: {
  @apply --layout-flex;
  -ms-flex-direction:column;
  -webkit-flex-direction:column;
  flex-direction:column;
};

}
</style>`;

  class BeruangLayout extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  window.customElements.define('beruang-layout', BeruangLayout);
})();
