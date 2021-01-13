import '../beruang-icon-svg.js';
import '../beruang-icon.js';

const tmpl = document.createElement('template');
tmpl.setAttribute('style', 'display: none;');
tmpl.innerHTML = `<beruang-icon-svg name="standard" size="24">
<svg><defs>
<g id="add">
<path d="m 11.508025,1.4080267 h 0.983949 V 22.391974 h -0.983949 z" />
<path d="M 1.5080249,11.508025 H 22.491975 v 0.98395 H 1.5080249 Z" />
</g>
</svg></defs>`;
document.head.appendChild(tmpl.content);
