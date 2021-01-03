(function() {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  *::part(fit) {
    position:absolute;
    top:0px;
    right:0px;
    bottom:0px;
    left:0px;
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
