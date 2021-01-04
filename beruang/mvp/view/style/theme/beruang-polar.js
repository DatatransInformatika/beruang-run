(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {
--primary-color:black;
--secondary-color:gray;
}
</style>`;

  class BeruangPolar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  window.customElements.define('beruang-theme', BeruangPolar);
})();
