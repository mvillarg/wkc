var app=function(){"use strict";function e(){}const t=e=>e;function a(e){return e()}function n(){return Object.create(null)}function c(e){e.forEach(a)}function i(e){return"function"==typeof e}function o(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function m(e){return null==e?"":e}const r="undefined"!=typeof window;let l=r?()=>window.performance.now():()=>Date.now(),s=r?e=>requestAnimationFrame(e):e;const u=new Set;function f(e){u.forEach((t=>{t.c(e)||(u.delete(t),t.f())})),0!==u.size&&s(f)}function d(e,t){e.appendChild(t)}function p(e,t,a){e.insertBefore(t,a||null)}function R(e){e.parentNode.removeChild(e)}function h(e,t){for(let a=0;a<e.length;a+=1)e[a]&&e[a].d(t)}function g(e){return document.createElement(e)}function $(e){return document.createTextNode(e)}function b(){return $(" ")}function v(){return $("")}function x(e,t,a,n){return e.addEventListener(t,a,n),()=>e.removeEventListener(t,a,n)}function y(e,t,a){null==a?e.removeAttribute(t):e.getAttribute(t)!==a&&e.setAttribute(t,a)}function w(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function N(e,t,a,n){e.style.setProperty(t,a,n?"important":"")}function _(e,t,a){e.classList[a?"add":"remove"](t)}function k(e,t){const a=document.createEvent("CustomEvent");return a.initCustomEvent(e,!1,!1,t),a}const C=new Set;let E,S=0;function D(e,t,a,n,c,i,o,m=0){const r=16.666/n;let l="{\n";for(let e=0;e<=1;e+=r){const n=t+(a-t)*i(e);l+=100*e+`%{${o(n,1-n)}}\n`}const s=l+`100% {${o(a,1-a)}}\n}`,u=`__svelte_${function(e){let t=5381,a=e.length;for(;a--;)t=(t<<5)-t^e.charCodeAt(a);return t>>>0}(s)}_${m}`,f=e.ownerDocument;C.add(f);const d=f.__svelte_stylesheet||(f.__svelte_stylesheet=f.head.appendChild(g("style")).sheet),p=f.__svelte_rules||(f.__svelte_rules={});p[u]||(p[u]=!0,d.insertRule(`@keyframes ${u} ${s}`,d.cssRules.length));const R=e.style.animation||"";return e.style.animation=`${R?`${R}, `:""}${u} ${n}ms linear ${c}ms 1 both`,S+=1,u}function L(e,t){const a=(e.style.animation||"").split(", "),n=a.filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")),c=a.length-n.length;c&&(e.style.animation=n.join(", "),S-=c,S||s((()=>{S||(C.forEach((e=>{const t=e.__svelte_stylesheet;let a=t.cssRules.length;for(;a--;)t.deleteRule(a);e.__svelte_rules={}})),C.clear())})))}function T(e){E=e}function P(){if(!E)throw new Error("Function called outside component initialization");return E}function z(e){P().$$.on_mount.push(e)}function O(){const e=P();return(t,a)=>{const n=e.$$.callbacks[t];if(n){const c=k(t,a);n.slice().forEach((t=>{t.call(e,c)}))}}}const A=[],M=[],Y=[],G=[],F=Promise.resolve();let H=!1;function K(e){Y.push(e)}let X=!1;const j=new Set;function B(){if(!X){X=!0;do{for(let e=0;e<A.length;e+=1){const t=A[e];T(t),U(t.$$)}for(T(null),A.length=0;M.length;)M.pop()();for(let e=0;e<Y.length;e+=1){const t=Y[e];j.has(t)||(j.add(t),t())}Y.length=0}while(A.length);for(;G.length;)G.pop()();H=!1,X=!1,j.clear()}}function U(e){if(null!==e.fragment){e.update(),c(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(K)}}let V;function Z(e,t,a){e.dispatchEvent(k(`${t?"intro":"outro"}${a}`))}const W=new Set;let I;function q(){I={r:0,c:[],p:I}}function J(){I.r||c(I.c),I=I.p}function Q(e,t){e&&e.i&&(W.delete(e),e.i(t))}function ee(e,t,a,n){if(e&&e.o){if(W.has(e))return;W.add(e),I.c.push((()=>{W.delete(e),n&&(a&&e.d(1),n())})),e.o(t)}}const te={duration:0};function ae(a,n,o,m){let r=n(a,o),d=m?0:1,p=null,R=null,h=null;function g(){h&&L(a,h)}function $(e,t){const a=e.b-d;return t*=Math.abs(a),{a:d,b:e.b,d:a,duration:t,start:e.start,end:e.start+t,group:e.group}}function b(n){const{delay:i=0,duration:o=300,easing:m=t,tick:b=e,css:v}=r||te,x={start:l()+i,b:n};n||(x.group=I,I.r+=1),p||R?R=x:(v&&(g(),h=D(a,d,n,o,i,m,v)),n&&b(0,1),p=$(x,o),K((()=>Z(a,n,"start"))),function(e){let t;0===u.size&&s(f),new Promise((a=>{u.add(t={c:e,f:a})}))}((e=>{if(R&&e>R.start&&(p=$(R,o),R=null,Z(a,p.b,"start"),v&&(g(),h=D(a,d,p.b,p.duration,0,m,r.css))),p)if(e>=p.end)b(d=p.b,1-d),Z(a,p.b,"end"),R||(p.b?g():--p.group.r||c(p.group.c)),p=null;else if(e>=p.start){const t=e-p.start;d=p.a+p.d*m(t/p.duration),b(d,1-d)}return!(!p&&!R)})))}return{run(e){i(r)?(V||(V=Promise.resolve(),V.then((()=>{V=null}))),V).then((()=>{r=r(),b(e)})):b(e)},end(){g(),p=R=null}}}function ne(e){e&&e.c()}function ce(e,t,n){const{fragment:o,on_mount:m,on_destroy:r,after_update:l}=e.$$;o&&o.m(t,n),K((()=>{const t=m.map(a).filter(i);r?r.push(...t):c(t),e.$$.on_mount=[]})),l.forEach(K)}function ie(e,t){const a=e.$$;null!==a.fragment&&(c(a.on_destroy),a.fragment&&a.fragment.d(t),a.on_destroy=a.fragment=null,a.ctx=[])}function oe(e,t){-1===e.$$.dirty[0]&&(A.push(e),H||(H=!0,F.then(B)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function me(t,a,i,o,m,r,l=[-1]){const s=E;T(t);const u=a.props||{},f=t.$$={fragment:null,ctx:null,props:r,update:e,not_equal:m,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(s?s.$$.context:[]),callbacks:n(),dirty:l,skip_bound:!1};let d=!1;if(f.ctx=i?i(t,u,((e,a,...n)=>{const c=n.length?n[0]:a;return f.ctx&&m(f.ctx[e],f.ctx[e]=c)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](c),d&&oe(t,e)),a})):[],f.update(),d=!0,c(f.before_update),f.fragment=!!o&&o(f.ctx),a.target){if(a.hydrate){const e=function(e){return Array.from(e.childNodes)}(a.target);f.fragment&&f.fragment.l(e),e.forEach(R)}else f.fragment&&f.fragment.c();a.intro&&Q(t.$$.fragment),ce(t,a.target,a.anchor),B()}T(s)}class re{$destroy(){ie(this,1),this.$destroy=e}$on(e,t){const a=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return a.push(t),()=>{const e=a.indexOf(t);-1!==e&&a.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function le(e,t,a){const n=e.slice();return n[10]=t[a],n[12]=a,n}function se(e,t,a){const n=e.slice();return n[13]=t[a],n}function ue(e,t,a){const n=e.slice();return n[13]=t[a],n}function fe(e){let t,a,n,c=e[13].columnTitle+"";return{c(){t=g("div"),a=$(c),n=b(),y(t,"class","column svelte-197dfk1"),N(t,"flex-grow",e[13].sizeProportion),_(t,"auto-hide",e[13].autoHide)},m(e,c){p(e,t,c),d(t,a),d(t,n)},p(e,n){2&n&&c!==(c=e[13].columnTitle+"")&&w(a,c),2&n&&N(t,"flex-grow",e[13].sizeProportion),2&n&&_(t,"auto-hide",e[13].autoHide)},d(e){e&&R(t)}}}function de(e){let t,a=e[10][e[13].propertyName]+"";return{c(){t=$(a)},m(e,a){p(e,t,a)},p(e,n){3&n&&a!==(a=e[10][e[13].propertyName]+"")&&w(t,a)},d(e){e&&R(t)}}}function pe(e){let t;function a(e,t){return""!==e[13].propertyName&&e[13].propertyName?e[10][e[13].propertyName]<=2?ge:he:$e}let n=a(e),c=n(e);return{c(){c.c(),t=v()},m(e,a){c.m(e,a),p(e,t,a)},p(e,i){n===(n=a(e))&&c?c.p(e,i):(c.d(1),c=n(e),c&&(c.c(),c.m(t.parentNode,t)))},d(e){c.d(e),e&&R(t)}}}function Re(e){let t,a,n,c;return{c(){t=g("div"),a=g("img"),y(a,"border","0"),y(a,"alt",n=e[13].alt),a.src!==(c=e[10][e[13].propertyName])&&y(a,"src",c),y(a,"width","100%"),y(a,"class","svelte-197dfk1"),y(t,"class","image svelte-197dfk1")},m(e,n){p(e,t,n),d(t,a)},p(e,t){2&t&&n!==(n=e[13].alt)&&y(a,"alt",n),3&t&&a.src!==(c=e[10][e[13].propertyName])&&y(a,"src",c)},d(e){e&&R(t)}}}function he(e){let t,a=e[10][e[13].propertyName]+1+"";return{c(){t=$(a)},m(e,a){p(e,t,a)},p(e,n){3&n&&a!==(a=e[10][e[13].propertyName]+1+"")&&w(t,a)},d(e){e&&R(t)}}}function ge(e){let t,a,n=e[2][e[10][e[13].propertyName]]+"";return{c(){t=g("div"),a=$(n),y(t,"class","icon svelte-197dfk1")},m(e,n){p(e,t,n),d(t,a)},p(e,t){3&t&&n!==(n=e[2][e[10][e[13].propertyName]]+"")&&w(a,n)},d(e){e&&R(t)}}}function $e(e){let t;let a=function(e,t){return e[12]<=2?ve:be}(e)(e);return{c(){a.c(),t=v()},m(e,n){a.m(e,n),p(e,t,n)},p(e,t){a.p(e,t)},d(e){a.d(e),e&&R(t)}}}function be(t){let a,n=t[12]+1+"";return{c(){a=$(n)},m(e,t){p(e,a,t)},p:e,d(e){e&&R(a)}}}function ve(t){let a,n,c=t[2][t[12]]+"";return{c(){a=g("div"),n=$(c),y(a,"class","icon svelte-197dfk1")},m(e,t){p(e,a,t),d(a,n)},p:e,d(e){e&&R(a)}}}function xe(e){let t;function a(e,t){return"image"===e[13].format?Re:"rank"===e[13].format?pe:de}let n=a(e),c=n(e);return{c(){t=g("div"),c.c(),y(t,"class","column svelte-197dfk1"),N(t,"flex-grow",e[13].sizeProportion),_(t,"auto-hide",e[13].autoHide)},m(e,a){p(e,t,a),c.m(t,null)},p(e,i){n===(n=a(e))&&c?c.p(e,i):(c.d(1),c=n(e),c&&(c.c(),c.m(t,null))),2&i&&N(t,"flex-grow",e[13].sizeProportion),2&i&&_(t,"auto-hide",e[13].autoHide)},d(e){e&&R(t),c.d()}}}function ye(e){let t,a,n,c,o,r=e[1],l=[];for(let t=0;t<r.length;t+=1)l[t]=xe(se(e,r,t));return{c(){t=g("div");for(let e=0;e<l.length;e+=1)l[e].c();a=b(),y(t,"class",n=m(e[3](e[12],e[0].length))+" svelte-197dfk1")},m(n,m){p(n,t,m);for(let e=0;e<l.length;e+=1)l[e].m(t,null);d(t,a),c||(o=x(t,"click",(function(){i(e[4](e[10]))&&e[4](e[10]).apply(this,arguments)})),c=!0)},p(c,i){if(e=c,7&i){let n;for(r=e[1],n=0;n<r.length;n+=1){const c=se(e,r,n);l[n]?l[n].p(c,i):(l[n]=xe(c),l[n].c(),l[n].m(t,a))}for(;n<l.length;n+=1)l[n].d(1);l.length=r.length}1&i&&n!==(n=m(e[3](e[12],e[0].length))+" svelte-197dfk1")&&y(t,"class",n)},d(e){e&&R(t),h(l,e),c=!1,o()}}}function we(t){let a,n,c,i=t[1],o=[];for(let e=0;e<i.length;e+=1)o[e]=fe(ue(t,i,e));let m=t[0],r=[];for(let e=0;e<m.length;e+=1)r[e]=ye(le(t,m,e));return{c(){a=g("div");for(let e=0;e<o.length;e+=1)o[e].c();n=b();for(let e=0;e<r.length;e+=1)r[e].c();c=v(),y(a,"class","row header svelte-197dfk1")},m(e,t){p(e,a,t);for(let e=0;e<o.length;e+=1)o[e].m(a,null);p(e,n,t);for(let a=0;a<r.length;a+=1)r[a].m(e,t);p(e,c,t)},p(e,[t]){if(2&t){let n;for(i=e[1],n=0;n<i.length;n+=1){const c=ue(e,i,n);o[n]?o[n].p(c,t):(o[n]=fe(c),o[n].c(),o[n].m(a,null))}for(;n<o.length;n+=1)o[n].d(1);o.length=i.length}if(31&t){let a;for(m=e[0],a=0;a<m.length;a+=1){const n=le(e,m,a);r[a]?r[a].p(n,t):(r[a]=ye(n),r[a].c(),r[a].m(c.parentNode,c))}for(;a<r.length;a+=1)r[a].d(1);r.length=m.length}},i:e,o:e,d(e){e&&R(a),h(o,e),e&&R(n),h(r,e),e&&R(c)}}}function Ne(e,t,a){let{rowData:n}=t,{columnData:c}=t,{roundedCornerStyle:i=!0}=t,{zebraRowStyle:o=!0}=t,{invertZebraOrder:m=!1}=t,{onRowClickCallback:r=null}=t;return e.$$set=e=>{"rowData"in e&&a(0,n=e.rowData),"columnData"in e&&a(1,c=e.columnData),"roundedCornerStyle"in e&&a(5,i=e.roundedCornerStyle),"zebraRowStyle"in e&&a(6,o=e.zebraRowStyle),"invertZebraOrder"in e&&a(7,m=e.invertZebraOrder),"onRowClickCallback"in e&&a(8,r=e.onRowClickCallback)},[n,c,["🥇","🥈","🥉"],function(e,t){let a="row";return r&&(a+=" clickable"),i&&0==e?a+=" first-row":i&&e==t-1&&(a+=" last-row"),o&&(a+=e%2==(m?1:0)?" zebra-primary-color":" zebra-secondary-color"),a},function(e){r&&r(e)},i,o,m,r]}class _e extends re{constructor(e){super(),me(this,e,Ne,we,o,{rowData:0,columnData:1,roundedCornerStyle:5,zebraRowStyle:6,invertZebraOrder:7,onRowClickCallback:8})}}function ke(t){let a,n;return{c(){a=g("h3"),n=$(t[0]),y(a,"class","svelte-13tkedg")},m(e,t){p(e,a,t),d(a,n)},p(e,[t]){1&t&&w(n,e[0])},i:e,o:e,d(e){e&&R(a)}}}function Ce(e,t,a){let{text:n}=t;return e.$$set=e=>{"text"in e&&a(0,n=e.text)},[n]}class Ee extends re{constructor(e){super(),me(this,e,Ce,ke,o,{text:0})}}function Se(t){let a,n,c,o;return{c(){a=g("button"),n=$(t[2]),y(a,"class","svelte-1mh2srn")},m(e,m){p(e,a,m),d(a,n),t[3](a),c||(o=x(a,"click",(function(){i(t[1])&&t[1].apply(this,arguments)})),c=!0)},p(e,[a]){t=e,4&a&&w(n,t[2])},i:e,o:e,d(e){e&&R(a),t[3](null),c=!1,o()}}}function De(e,t,a){let{onClickCallback:n}=t,{textLabel:c}=t,{domRef:i=null}=t;return e.$$set=e=>{"onClickCallback"in e&&a(1,n=e.onClickCallback),"textLabel"in e&&a(2,c=e.textLabel),"domRef"in e&&a(0,i=e.domRef)},[i,n,c,function(e){M[e?"unshift":"push"]((()=>{i=e,a(0,i)}))}]}class Le extends re{constructor(e){super(),me(this,e,De,Se,o,{onClickCallback:1,textLabel:2,domRef:0})}}function Te(e,t,a){const n=e.slice();return n[9]=t[a],n[11]=a,n}function Pe(e){let t,a,n,c,i=e[9]+"";function o(){return e[8](e[11])}return{c(){t=g("a"),a=$(i),y(t,"href","#"),y(t,"class","svelte-1adfmk1")},m(e,i){p(e,t,i),d(t,a),n||(c=x(t,"click",o),n=!0)},p(t,n){e=t,2&n&&i!==(i=e[9]+"")&&w(a,i)},d(e){e&&R(t),n=!1,c()}}}function ze(e){let t,a,n,c,i,o,m,r;function l(t){e[7].call(null,t)}let s={onClickCallback:e[5],textLabel:e[0]};void 0!==e[4]&&(s.domRef=e[4]),a=new Le({props:s}),M.push((()=>function(e,t,a){const n=e.$$.props[t];void 0!==n&&(e.$$.bound[n]=a,a(e.$$.ctx[n]))}(a,"domRef",l)));let u=e[1],f=[];for(let t=0;t<u.length;t+=1)f[t]=Pe(Te(e,u,t));return{c(){t=g("div"),ne(a.$$.fragment),c=b(),i=g("div");for(let e=0;e<f.length;e+=1)f[e].c();y(i,"class","dropdown-content svelte-1adfmk1"),_(i,"show",!0===e[3]),y(t,"class","dropdown svelte-1adfmk1")},m(n,l){p(n,t,l),ce(a,t,null),d(t,c),d(t,i);for(let e=0;e<f.length;e+=1)f[e].m(i,null);o=!0,m||(r=x(window,"click",e[6]),m=!0)},p(e,[t]){const c={};var o;if(1&t&&(c.textLabel=e[0]),!n&&16&t&&(n=!0,c.domRef=e[4],o=()=>n=!1,G.push(o)),a.$set(c),6&t){let a;for(u=e[1],a=0;a<u.length;a+=1){const n=Te(e,u,a);f[a]?f[a].p(n,t):(f[a]=Pe(n),f[a].c(),f[a].m(i,null))}for(;a<f.length;a+=1)f[a].d(1);f.length=u.length}8&t&&_(i,"show",!0===e[3])},i(e){o||(Q(a.$$.fragment,e),o=!0)},o(e){ee(a.$$.fragment,e),o=!1},d(e){e&&R(t),ie(a),h(f,e),m=!1,r()}}}function Oe(e,t,a){let{textLabel:n}=t,{items:c}=t,{onSelectCallback:i}=t,o=!1,m=null;return e.$$set=e=>{"textLabel"in e&&a(0,n=e.textLabel),"items"in e&&a(1,c=e.items),"onSelectCallback"in e&&a(2,i=e.onSelectCallback)},[n,c,i,o,m,function(){a(3,o=!0)},function(e){e.target!==m&&a(3,o=!o&&o)},function(e){m=e,a(4,m)},e=>{i(e)}]}class Ae extends re{constructor(e){super(),me(this,e,Oe,ze,o,{textLabel:0,items:1,onSelectCallback:2})}}function Me(e){let t,a,n,c,i,o,m;return a=new Ee({props:{text:e[1]}}),c=new Ae({props:{textLabel:"Select Race",items:e[2],onSelectCallback:e[4]}}),o=new _e({props:{rowData:e[0],columnData:[{columnTitle:"",propertyName:"picture",format:"image",sizeProportion:1,alt:"Driver's picture"},{columnTitle:"Rank",propertyName:void 0,format:"rank",sizeProportion:1},{columnTitle:"Name",propertyName:"name",format:"text",sizeProportion:3},{columnTitle:"Team",propertyName:"team",format:"text",sizeProportion:2,autoHide:!0}],onRowClickCallback:e[3],roundedCornerStyle:!0,zebraRowStyle:!0}}),{c(){t=g("div"),ne(a.$$.fragment),n=b(),ne(c.$$.fragment),i=b(),ne(o.$$.fragment),y(t,"class","flex-container v-align-baseline svelte-sidx20")},m(e,r){p(e,t,r),ce(a,t,null),d(t,n),ce(c,t,null),p(e,i,r),ce(o,e,r),m=!0},p(e,[t]){const n={};2&t&&(n.text=e[1]),a.$set(n);const c={};1&t&&(c.rowData=e[0]),o.$set(c)},i(e){m||(Q(a.$$.fragment,e),Q(c.$$.fragment,e),Q(o.$$.fragment,e),m=!0)},o(e){ee(a.$$.fragment,e),ee(c.$$.fragment,e),ee(o.$$.fragment,e),m=!1},d(e){e&&R(t),ie(a),ie(c),e&&R(i),ie(o,e)}}}const Ye="Ranking / ";function Ge(e,t,a){let{data:n}=t;const c=n[0].races.map((e=>e.name));c.unshift("Global");let i=-1,o=Ye+c[0];const m=O();function r(){a(0,n=i<0?n.sort(((e,t)=>e.globalPosition-t.globalPosition)):n.sort(((e,t)=>e.races[i].position-t.races[i].position)))}return z((()=>{r()})),e.$$set=e=>{"data"in e&&a(0,n=e.data)},[n,o,c,function(e){m("message",{...e})},function(e){i=e-1,a(1,o=Ye+c[e]),r()}]}class Fe extends re{constructor(e){super(),me(this,e,Ge,Me,o,{data:0})}}function He(t){let a,n,c,i,o,r,l,s,u,f,h,v,x,N,_,k,C,E,S,D,L,T,P,z,O,A,M,Y,G=t[0].name+"",F=t[0].age+"",H=t[0].team+"",K=t[1](t[0].globalPosition)+"";return{c(){a=g("div"),a.textContent="Driver Card",n=b(),c=g("div"),i=g("div"),o=g("img"),s=b(),u=g("div"),u.textContent="Name",f=b(),h=g("div"),v=$(G),x=b(),N=g("div"),N.textContent="Age",_=b(),k=g("div"),C=$(F),E=b(),S=g("div"),S.textContent="Team",D=b(),L=g("div"),T=$(H),P=b(),z=g("div"),z.textContent="Global Ranking",O=b(),A=g("div"),M=$(K),y(a,"class","card-header svelte-6mowod"),y(o,"border","0"),y(o,"alt",r=t[0].name),o.src!==(l=t[0].picture)&&y(o,"src",l),y(o,"width","100%"),y(o,"class","svelte-6mowod"),y(i,"class","avatar svelte-6mowod"),y(u,"class","title svelte-6mowod"),y(h,"class","desc svelte-6mowod"),y(N,"class","title svelte-6mowod"),y(k,"class","desc svelte-6mowod"),y(S,"class","title svelte-6mowod"),y(L,"class","desc svelte-6mowod"),y(z,"class","title svelte-6mowod"),y(A,"class",Y=m(t[0].globalPosition<=2?"icon":"desc")+" svelte-6mowod"),y(c,"class","card-body svelte-6mowod")},m(e,t){p(e,a,t),p(e,n,t),p(e,c,t),d(c,i),d(i,o),d(c,s),d(c,u),d(c,f),d(c,h),d(h,v),d(c,x),d(c,N),d(c,_),d(c,k),d(k,C),d(c,E),d(c,S),d(c,D),d(c,L),d(L,T),d(c,P),d(c,z),d(c,O),d(c,A),d(A,M)},p(e,[t]){1&t&&r!==(r=e[0].name)&&y(o,"alt",r),1&t&&o.src!==(l=e[0].picture)&&y(o,"src",l),1&t&&G!==(G=e[0].name+"")&&w(v,G),1&t&&F!==(F=e[0].age+"")&&w(C,F),1&t&&H!==(H=e[0].team+"")&&w(T,H),1&t&&K!==(K=e[1](e[0].globalPosition)+"")&&w(M,K),1&t&&Y!==(Y=m(e[0].globalPosition<=2?"icon":"desc")+" svelte-6mowod")&&y(A,"class",Y)},i:e,o:e,d(e){e&&R(a),e&&R(n),e&&R(c)}}}function Ke(e,t,a){let{data:n}=t;const c=["🥇","🥈","🥉"];return e.$$set=e=>{"data"in e&&a(0,n=e.data)},[n,function(e){return e<=2?c[e]:e+1}]}class Xe extends re{constructor(e){super(),me(this,e,Ke,He,o,{data:0})}}function je(e){let t,a,n,c,i,o,m,r,l,s,u,f;return a=new Ee({props:{text:"Driver Season Results"}}),c=new Le({props:{onClickCallback:e[1],textLabel:"Back"}}),r=new Xe({props:{data:e[0]}}),u=new _e({props:{rowData:e[0].races,columnData:[{columnTitle:"Race",propertyName:"name",format:"text",sizeProportion:1},{columnTitle:"Position",propertyName:"position",format:"rank",sizeProportion:1},{columnTitle:"Time",propertyName:"time",format:"text",sizeProportion:2}],roundedCornerStyle:!0,zebraRowStyle:!0}}),{c(){t=g("div"),ne(a.$$.fragment),n=b(),ne(c.$$.fragment),i=b(),o=g("div"),m=g("div"),ne(r.$$.fragment),l=b(),s=g("div"),ne(u.$$.fragment),y(t,"class","flex-container v-align-baseline svelte-ctu2el"),y(m,"class","card-container svelte-ctu2el"),y(s,"class","table-container svelte-ctu2el"),y(o,"class","flex-container flex-wrap svelte-ctu2el")},m(e,R){p(e,t,R),ce(a,t,null),d(t,n),ce(c,t,null),p(e,i,R),p(e,o,R),d(o,m),ce(r,m,null),d(o,l),d(o,s),ce(u,s,null),f=!0},p(e,[t]){const a={};1&t&&(a.data=e[0]),r.$set(a);const n={};1&t&&(n.rowData=e[0].races),u.$set(n)},i(e){f||(Q(a.$$.fragment,e),Q(c.$$.fragment,e),Q(r.$$.fragment,e),Q(u.$$.fragment,e),f=!0)},o(e){ee(a.$$.fragment,e),ee(c.$$.fragment,e),ee(r.$$.fragment,e),ee(u.$$.fragment,e),f=!1},d(e){e&&R(t),ie(a),ie(c),e&&R(i),e&&R(o),ie(r),ie(u)}}}function Be(e,t,a){let{data:n}=t;const c=O();return e.$$set=e=>{"data"in e&&a(0,n=e.data)},[n,function(){c("message",{action:"back"})}]}class Ue extends re{constructor(e){super(),me(this,e,Be,je,o,{data:0})}}function Ve(e){let t,a;return t=new Ue({props:{data:e[2]}}),t.$on("message",e[4]),{c(){ne(t.$$.fragment)},m(e,n){ce(t,e,n),a=!0},p(e,a){const n={};4&a&&(n.data=e[2]),t.$set(n)},i(e){a||(Q(t.$$.fragment,e),a=!0)},o(e){ee(t.$$.fragment,e),a=!1},d(e){ie(t,e)}}}function Ze(e){let t,a;return t=new Fe({props:{data:e[0]}}),t.$on("message",e[3]),{c(){ne(t.$$.fragment)},m(e,n){ce(t,e,n),a=!0},p(e,a){const n={};1&a&&(n.data=e[0]),t.$set(n)},i(e){a||(Q(t.$$.fragment,e),a=!0)},o(e){ee(t.$$.fragment,e),a=!1},d(e){ie(t,e)}}}function We(e){let t,a,n,c;const i=[Ze,Ve],o=[];function m(e,t){return e[1]?1:0}return t=m(e),a=o[t]=i[t](e),{c(){a.c(),n=v()},m(e,a){o[t].m(e,a),p(e,n,a),c=!0},p(e,[c]){let r=t;t=m(e),t===r?o[t].p(e,c):(q(),ee(o[r],1,1,(()=>{o[r]=null})),J(),a=o[t],a?a.p(e,c):(a=o[t]=i[t](e),a.c()),Q(a,1),a.m(n.parentNode,n))},i(e){c||(Q(a),c=!0)},o(e){ee(a),c=!1},d(e){o[t].d(e),e&&R(n)}}}function Ie(e,t,a){let n,{data:c}=t,i=!1;return e.$$set=e=>{"data"in e&&a(0,c=e.data)},[c,i,n,function(e){a(1,i=!0),a(2,n={...e.detail})},function(e){a(1,i=!1)}]}class qe extends re{constructor(e){super(),me(this,e,Ie,We,o,{data:0})}}function Je(e){const t=e-1;return t*t*t+1}function Qe(e,{delay:a=0,duration:n=400,easing:c=t}){const i=+getComputedStyle(e).opacity;return{delay:a,duration:n,easing:c,css:e=>"opacity: "+e*i}}function et(e,{delay:t=0,duration:a=400,easing:n=Je,x:c=0,y:i=0,opacity:o=0}){const m=getComputedStyle(e),r=+m.opacity,l="none"===m.transform?"":m.transform,s=r*(1-o);return{delay:t,duration:a,easing:n,css:(e,t)=>`\n\t\t\ttransform: ${l} translate(${(1-e)*c}px, ${(1-e)*i}px);\n\t\t\topacity: ${r-s*t}`}}function tt(e,t,a){const n=e.slice();return n[6]=t[a],n}function at(e,t,a){const n=e.slice();return n[9]=t[a],n}function nt(e){let t,a,n,c,i,o,m,r,l,s=e[9].c.charAt(0)+"",u=e[9].c.substring(1)+"",f=(e[9].x>=-200?ot:"")+"";return{c(){t=g("h1"),a=$(s),c=b(),i=g("span"),o=$(u),m=$(f),y(t,"class","svelte-1i9fp1t"),y(i,"class","non-capital svelte-1i9fp1t")},m(e,n){p(e,t,n),d(t,a),p(e,c,n),p(e,i,n),d(i,o),d(i,m),l=!0},p(t,a){e=t},i(a){l||(K((()=>{n||(n=ae(t,et,{x:e[9].x,duration:2e3},!0)),n.run(1)})),K((()=>{r||(r=ae(i,Qe,{duration:1500},!0)),r.run(1)})),l=!0)},o(a){n||(n=ae(t,et,{x:e[9].x,duration:2e3},!1)),n.run(0),r||(r=ae(i,Qe,{duration:1500},!1)),r.run(0),l=!1},d(e){e&&R(t),e&&n&&n.end(),e&&R(c),e&&R(i),e&&r&&r.end()}}}function ct(e){let t,a,n,c,i,o=e[6].c+"",m=(e[6].x>=-200?ot:"")+"";return{c(){t=g("h1"),a=$(o),n=$(m),y(t,"class","svelte-1i9fp1t")},m(e,c){p(e,t,c),d(t,a),d(t,n),i=!0},p(t,a){e=t},i(a){i||(K((()=>{c||(c=ae(t,et,{x:e[6].x,duration:2e3},!0)),c.run(1)})),i=!0)},o(a){c||(c=ae(t,et,{x:e[6].x,duration:2e3},!1)),c.run(0),i=!1},d(e){e&&R(t),e&&c&&c.end()}}}function it(e){let t,a,n,c,i=e[0],o=[];for(let t=0;t<i.length;t+=1)o[t]=nt(at(e,i,t));const m=e=>ee(o[e],1,1,(()=>{o[e]=null}));let r=e[1],l=[];for(let t=0;t<r.length;t+=1)l[t]=ct(tt(e,r,t));const s=e=>ee(l[e],1,1,(()=>{l[e]=null}));return{c(){t=g("div");for(let e=0;e<o.length;e+=1)o[e].c();a=b(),n=g("div");for(let e=0;e<l.length;e+=1)l[e].c();y(t,"class","full-text svelte-1i9fp1t"),y(n,"class","brief-text svelte-1i9fp1t")},m(e,i){p(e,t,i);for(let e=0;e<o.length;e+=1)o[e].m(t,null);p(e,a,i),p(e,n,i);for(let e=0;e<l.length;e+=1)l[e].m(n,null);c=!0},p(e,[a]){if(1&a){let n;for(i=e[0],n=0;n<i.length;n+=1){const c=at(e,i,n);o[n]?(o[n].p(c,a),Q(o[n],1)):(o[n]=nt(c),o[n].c(),Q(o[n],1),o[n].m(t,null))}for(q(),n=i.length;n<o.length;n+=1)m(n);J()}if(2&a){let t;for(r=e[1],t=0;t<r.length;t+=1){const c=tt(e,r,t);l[t]?(l[t].p(c,a),Q(l[t],1)):(l[t]=ct(c),l[t].c(),Q(l[t],1),l[t].m(n,null))}for(q(),t=r.length;t<l.length;t+=1)s(t);J()}},i(e){if(!c){for(let e=0;e<i.length;e+=1)Q(o[e]);for(let e=0;e<r.length;e+=1)Q(l[e]);c=!0}},o(e){o=o.filter(Boolean);for(let e=0;e<o.length;e+=1)ee(o[e]);l=l.filter(Boolean);for(let e=0;e<l.length;e+=1)ee(l[e]);c=!1},d(e){e&&R(t),h(o,e),e&&R(a),e&&R(n),h(l,e)}}}const ot="   ";function mt(e,t,a){let{longTitle:n}=t,{shortTitle:c}=t;const i=n.split(" "),o=c.split(""),m=[],r=[];return i.forEach(((e,t)=>{m.push({c:e,x:-100*(t+1)})})),o.forEach(((e,t)=>{r.push({c:e,x:-100*(t+1)})})),e.$$set=e=>{"longTitle"in e&&a(2,n=e.longTitle),"shortTitle"in e&&a(3,c=e.shortTitle)},[m,r,n,c]}class rt extends re{constructor(e){super(),me(this,e,mt,it,o,{longTitle:2,shortTitle:3})}}function lt(t){let a,n,c,i,o,m,r,l,s,u,f,h,v;return{c(){a=g("hr"),n=b(),c=g("p"),i=$("© "),o=g("i"),m=$(t[0]),r=b(),l=$(t[1]),s=$(", prepared for "),u=g("span"),f=$(t[2]),h=$(" using "),v=g("a"),v.textContent="Svelte",y(a,"class","svelte-aevb4j"),y(u,"class","svelte-aevb4j"),y(v,"href","https://svelte.dev/tutorial"),y(c,"class","svelte-aevb4j")},m(e,t){p(e,a,t),p(e,n,t),p(e,c,t),d(c,i),d(c,o),d(o,m),d(o,r),d(o,l),d(c,s),d(c,u),d(u,f),d(c,h),d(c,v)},p(e,[t]){1&t&&w(m,e[0]),2&t&&w(l,e[1]),4&t&&w(f,e[2])},i:e,o:e,d(e){e&&R(a),e&&R(n),e&&R(c)}}}function st(e,t,a){let{year:n="2021"}=t,{author:c}=t,{owner:i}=t;return e.$$set=e=>{"year"in e&&a(0,n=e.year),"author"in e&&a(1,c=e.author),"owner"in e&&a(2,i=e.owner)},[n,c,i]}class ut extends re{constructor(e){super(),me(this,e,st,lt,o,{year:0,author:1,owner:2})}}function ft(e){let t=e.split(":");return 60*parseInt(t[0])*60*1e3+60*parseInt(t[1])*1e3+1e3*parseInt(t[2].split("."[0]))+parseInt(t[2].split("."[1]))}function dt(e,t){e.sort(((e,a)=>ft(e.races[t].time)-ft(a.races[t].time))),e.forEach(((e,a)=>{e.races[t].position=a}))}var pt=[{_id:"5f3a3c5faa55d5c4ea549ac1",picture:"http://placehold.it/64x64",age:38,name:"Padilla Adkins",team:"EURON",races:[{name:"Race 0",time:"1:11:39.515"},{name:"Race 1",time:"1:17:24.312"},{name:"Race 2",time:"1:22:29.376"},{name:"Race 3",time:"1:10:34.491"},{name:"Race 4",time:"1:51:45.103"},{name:"Race 5",time:"1:44:16.158"},{name:"Race 6",time:"1:30:14.658"},{name:"Race 7",time:"1:29:41.505"},{name:"Race 8",time:"1:47:52.109"},{name:"Race 9",time:"1:23:38.271"}]},{_id:"5f3a3c5f4984bd9be6a6f655",picture:"http://placehold.it/64x64",age:39,name:"Richards Floyd",team:"VENDBLEND",races:[{name:"Race 0",time:"1:16:53.224"},{name:"Race 1",time:"1:31:32.533"},{name:"Race 2",time:"1:26:56.186"},{name:"Race 3",time:"1:0:15.169"},{name:"Race 4",time:"1:21:5.428"},{name:"Race 5",time:"1:26:18.202"},{name:"Race 6",time:"1:22:24.379"},{name:"Race 7",time:"1:22:9.316"},{name:"Race 8",time:"1:28:6.268"},{name:"Race 9",time:"1:57:56.461"}]},{_id:"5f3a3c5fc4c1a2c2dd9df702",picture:"http://placehold.it/64x64",age:39,name:"Jewel Mcdaniel",team:"GENESYNK",races:[{name:"Race 0",time:"1:4:42.549"},{name:"Race 1",time:"1:53:19.849"},{name:"Race 2",time:"1:51:25.667"},{name:"Race 3",time:"1:58:26.847"},{name:"Race 4",time:"1:47:42.841"},{name:"Race 5",time:"1:51:24.73"},{name:"Race 6",time:"1:4:0.075"},{name:"Race 7",time:"1:52:40.457"},{name:"Race 8",time:"1:18:17.738"},{name:"Race 9",time:"1:37:35.128"}]},{_id:"5f3a3c5f8a23c3e2c85cab74",picture:"http://placehold.it/64x64",age:21,name:"Welch Mays",team:"UXMOX",races:[{name:"Race 0",time:"1:21:48.956"},{name:"Race 1",time:"1:0:56.521"},{name:"Race 2",time:"1:53:9.793"},{name:"Race 3",time:"1:51:15.265"},{name:"Race 4",time:"1:59:43.968"},{name:"Race 5",time:"1:31:27.167"},{name:"Race 6",time:"1:59:49.156"},{name:"Race 7",time:"1:18:49.836"},{name:"Race 8",time:"1:47:46.692"},{name:"Race 9",time:"1:10:57.173"}]},{_id:"5f3a3c5f355a5be1fb74076a",picture:"http://placehold.it/64x64",age:28,name:"Lilian Levine",team:"UXMOX",races:[{name:"Race 0",time:"1:48:32.99"},{name:"Race 1",time:"1:1:41.043"},{name:"Race 2",time:"1:22:57.229"},{name:"Race 3",time:"1:4:40.618"},{name:"Race 4",time:"1:43:28.734"},{name:"Race 5",time:"1:59:19.861"},{name:"Race 6",time:"1:16:19.976"},{name:"Race 7",time:"1:28:39.612"},{name:"Race 8",time:"1:23:2.596"},{name:"Race 9",time:"1:38:32.305"}]},{_id:"5f3a3c5fc42b87fc0d6e31a9",picture:"http://placehold.it/64x64",age:27,name:"Harmon Mills",team:"GENESYNK",races:[{name:"Race 0",time:"1:38:45.622"},{name:"Race 1",time:"1:11:14.969"},{name:"Race 2",time:"1:46:46.861"},{name:"Race 3",time:"1:44:18.84"},{name:"Race 4",time:"1:42:3.761"},{name:"Race 5",time:"1:25:17.811"},{name:"Race 6",time:"1:12:57.672"},{name:"Race 7",time:"1:55:48.879"},{name:"Race 8",time:"1:34:55.445"},{name:"Race 9",time:"1:58:25.125"}]},{_id:"5f3a3c5f86cbcda872a8f1ed",picture:"http://placehold.it/64x64",age:24,name:"Olsen Donaldson",team:"DEVAWAY",races:[{name:"Race 0",time:"1:26:39.47"},{name:"Race 1",time:"1:8:11.491"},{name:"Race 2",time:"1:50:5.416"},{name:"Race 3",time:"1:48:56.726"},{name:"Race 4",time:"1:17:8.218"},{name:"Race 5",time:"1:26:42.32"},{name:"Race 6",time:"1:55:43.729"},{name:"Race 7",time:"1:6:13.931"},{name:"Race 8",time:"1:48:25.087"},{name:"Race 9",time:"1:52:38.604"}]},{_id:"5f3a3c5f65e328c1a1263781",picture:"http://placehold.it/64x64",age:29,name:"Anne Johnston",team:"DEVAWAY",races:[{name:"Race 0",time:"1:46:20.667"},{name:"Race 1",time:"1:25:48.31"},{name:"Race 2",time:"1:0:26.598"},{name:"Race 3",time:"1:40:54.377"},{name:"Race 4",time:"1:53:38.533"},{name:"Race 5",time:"1:27:11.601"},{name:"Race 6",time:"1:20:27.344"},{name:"Race 7",time:"1:48:58.123"},{name:"Race 8",time:"1:56:35.634"},{name:"Race 9",time:"1:47:46.822"}]},{_id:"5f3a3c5fde8d2bb91cab3352",picture:"http://placehold.it/64x64",age:31,name:"Cherie Fitzgerald",team:"EURON",races:[{name:"Race 0",time:"1:46:21.421"},{name:"Race 1",time:"1:43:5.956"},{name:"Race 2",time:"1:27:27.411"},{name:"Race 3",time:"1:32:43.108"},{name:"Race 4",time:"1:51:21.313"},{name:"Race 5",time:"1:23:48.083"},{name:"Race 6",time:"1:6:0.916"},{name:"Race 7",time:"1:57:54.609"},{name:"Race 8",time:"1:54:32.003"},{name:"Race 9",time:"1:31:15.369"}]},{_id:"5f3a3c5f5a4ce67633e028ad",picture:"http://placehold.it/64x64",age:29,name:"Debora Sears",team:"GENESYNK",races:[{name:"Race 0",time:"1:16:52.691"},{name:"Race 1",time:"1:20:32.393"},{name:"Race 2",time:"1:35:38.871"},{name:"Race 3",time:"1:35:16.146"},{name:"Race 4",time:"1:41:49.539"},{name:"Race 5",time:"1:57:46.918"},{name:"Race 6",time:"1:12:47.641"},{name:"Race 7",time:"1:55:52.599"},{name:"Race 8",time:"1:26:36.246"},{name:"Race 9",time:"1:22:26.748"}]},{_id:"5f3a3c5f0e202f4a527bf502",picture:"http://placehold.it/64x64",age:27,name:"Morris Combs",team:"EURON",races:[{name:"Race 0",time:"1:47:3.23"},{name:"Race 1",time:"1:28:54.578"},{name:"Race 2",time:"1:40:5.387"},{name:"Race 3",time:"1:28:49.392"},{name:"Race 4",time:"1:47:18.89"},{name:"Race 5",time:"1:11:2.444"},{name:"Race 6",time:"1:22:29.818"},{name:"Race 7",time:"1:4:24.429"},{name:"Race 8",time:"1:14:15.846"},{name:"Race 9",time:"1:39:5.08"}]},{_id:"5f3a3c5ff1c5e552442b292d",picture:"http://placehold.it/64x64",age:29,name:"Naomi Rutledge",team:"VENDBLEND",races:[{name:"Race 0",time:"1:44:36.643"},{name:"Race 1",time:"1:15:9.451"},{name:"Race 2",time:"1:50:37.69"},{name:"Race 3",time:"1:8:31.728"},{name:"Race 4",time:"1:32:50.154"},{name:"Race 5",time:"1:51:22.663"},{name:"Race 6",time:"1:30:35.122"},{name:"Race 7",time:"1:17:25.795"},{name:"Race 8",time:"1:36:56.224"},{name:"Race 9",time:"1:32:52.749"}]},{_id:"5f3a3c5f086b43d06ac5a984",picture:"http://placehold.it/64x64",age:35,name:"Guerra Rosario",team:"DEVAWAY",races:[{name:"Race 0",time:"1:22:53.242"},{name:"Race 1",time:"1:54:8.187"},{name:"Race 2",time:"1:1:5.747"},{name:"Race 3",time:"1:44:13.98"},{name:"Race 4",time:"1:30:28.754"},{name:"Race 5",time:"1:13:14.073"},{name:"Race 6",time:"1:41:58.781"},{name:"Race 7",time:"1:8:10.042"},{name:"Race 8",time:"1:54:42.966"},{name:"Race 9",time:"1:58:35.652"}]},{_id:"5f3a3c5f2744fa89349fe0f3",picture:"http://placehold.it/64x64",age:34,name:"Nguyen Fletcher",team:"GENESYNK",races:[{name:"Race 0",time:"1:8:15.559"},{name:"Race 1",time:"1:50:21.71"},{name:"Race 2",time:"1:4:55.952"},{name:"Race 3",time:"1:34:18.34"},{name:"Race 4",time:"1:59:9.568"},{name:"Race 5",time:"1:59:42.241"},{name:"Race 6",time:"1:46:33.387"},{name:"Race 7",time:"1:55:49.791"},{name:"Race 8",time:"1:29:4.4"},{name:"Race 9",time:"1:45:37.349"}]},{_id:"5f3a3c5f970bc40e21b8ee63",picture:"http://placehold.it/64x64",age:27,name:"Lisa Montoya",team:"GENESYNK",races:[{name:"Race 0",time:"1:19:38.374"},{name:"Race 1",time:"1:52:42.372"},{name:"Race 2",time:"1:59:9.399"},{name:"Race 3",time:"1:33:33.531"},{name:"Race 4",time:"1:15:15.002"},{name:"Race 5",time:"1:12:1.19"},{name:"Race 6",time:"1:56:48.602"},{name:"Race 7",time:"1:49:20.073"},{name:"Race 8",time:"1:53:21.555"},{name:"Race 9",time:"1:40:52.086"}]},{_id:"5f3a3c5f0a5f78c603fc1d14",picture:"http://placehold.it/64x64",age:30,name:"Misty Marsh",team:"UXMOX",races:[{name:"Race 0",time:"1:39:54.655"},{name:"Race 1",time:"1:26:8.059"},{name:"Race 2",time:"1:23:11.046"},{name:"Race 3",time:"1:41:4.32"},{name:"Race 4",time:"1:9:53.404"},{name:"Race 5",time:"1:13:42.517"},{name:"Race 6",time:"1:48:18.026"},{name:"Race 7",time:"1:55:3.198"},{name:"Race 8",time:"1:19:46.733"},{name:"Race 9",time:"1:40:17.202"}]},{_id:"5f3a3c5f876488cda4de309a",picture:"http://placehold.it/64x64",age:32,name:"Stanton Ayala",team:"CONFRENZY",races:[{name:"Race 0",time:"1:10:20.58"},{name:"Race 1",time:"1:53:44.181"},{name:"Race 2",time:"1:5:18.992"},{name:"Race 3",time:"1:47:55.459"},{name:"Race 4",time:"1:49:31.585"},{name:"Race 5",time:"1:38:20.841"},{name:"Race 6",time:"1:48:19.814"},{name:"Race 7",time:"1:36:18.023"},{name:"Race 8",time:"1:31:21.812"},{name:"Race 9",time:"1:48:26.514"}]},{_id:"5f3a3c5f8bd0087dc1b70b77",picture:"http://placehold.it/64x64",age:39,name:"Gilda Lindsay",team:"UXMOX",races:[{name:"Race 0",time:"1:53:0.702"},{name:"Race 1",time:"1:28:42.037"},{name:"Race 2",time:"1:53:24.687"},{name:"Race 3",time:"1:38:10.498"},{name:"Race 4",time:"1:46:58.467"},{name:"Race 5",time:"1:21:51.764"},{name:"Race 6",time:"1:2:8.072"},{name:"Race 7",time:"1:26:54.026"},{name:"Race 8",time:"1:56:31.087"},{name:"Race 9",time:"1:56:5.192"}]},{_id:"5f3a3c5f8df3fe2e8c6ae477",picture:"http://placehold.it/64x64",age:29,name:"Daniels Manning",team:"CONFRENZY",races:[{name:"Race 0",time:"1:0:57.037"},{name:"Race 1",time:"1:19:21.263"},{name:"Race 2",time:"1:16:58.378"},{name:"Race 3",time:"1:21:1.485"},{name:"Race 4",time:"1:16:2.04"},{name:"Race 5",time:"1:50:30.417"},{name:"Race 6",time:"1:54:33.324"},{name:"Race 7",time:"1:15:45.267"},{name:"Race 8",time:"1:2:42.528"},{name:"Race 9",time:"1:24:7.128"}]},{_id:"5f3a3c5f0c713e786503e798",picture:"http://placehold.it/64x64",age:39,name:"Howe Gaines",team:"VENDBLEND",races:[{name:"Race 0",time:"1:47:32.432"},{name:"Race 1",time:"1:40:12.872"},{name:"Race 2",time:"1:44:7.808"},{name:"Race 3",time:"1:47:10.399"},{name:"Race 4",time:"1:16:48.487"},{name:"Race 5",time:"1:35:58.714"},{name:"Race 6",time:"1:9:2.596"},{name:"Race 7",time:"1:58:10.066"},{name:"Race 8",time:"1:10:34.986"},{name:"Race 9",time:"1:11:36.368"}]},{_id:"5f3a3c5f37ce779261434517",picture:"http://placehold.it/64x64",age:24,name:"Hillary Leonard",team:"CONFRENZY",races:[{name:"Race 0",time:"1:48:28.477"},{name:"Race 1",time:"1:37:16.852"},{name:"Race 2",time:"1:7:36.766"},{name:"Race 3",time:"1:54:50.18"},{name:"Race 4",time:"1:11:35.705"},{name:"Race 5",time:"1:1:52.361"},{name:"Race 6",time:"1:15:58.031"},{name:"Race 7",time:"1:49:1.957"},{name:"Race 8",time:"1:50:46.778"},{name:"Race 9",time:"1:2:21.754"}]},{_id:"5f3a3c5fdc6f6738e4f35dd7",picture:"http://placehold.it/64x64",age:32,name:"Reva French",team:"GENESYNK",races:[{name:"Race 0",time:"1:53:36.228"},{name:"Race 1",time:"1:59:58.061"},{name:"Race 2",time:"1:27:19.038"},{name:"Race 3",time:"1:0:6.003"},{name:"Race 4",time:"1:6:38.885"},{name:"Race 5",time:"1:50:42.074"},{name:"Race 6",time:"1:42:55.71"},{name:"Race 7",time:"1:38:16.095"},{name:"Race 8",time:"1:56:0.979"},{name:"Race 9",time:"1:29:18.093"}]}];function Rt(e){let t,a,n,c,i,o,m;return a=new rt({props:{longTitle:e[0],shortTitle:e[1]}}),c=new qe({props:{data:e[2]}}),o=new ut({props:{author:"Miguel Villar",owner:"devaway_"}}),{c(){t=g("main"),ne(a.$$.fragment),n=b(),ne(c.$$.fragment),i=b(),ne(o.$$.fragment),y(t,"class","svelte-19eib3m")},m(e,r){p(e,t,r),ce(a,t,null),d(t,n),ce(c,t,null),d(t,i),ce(o,t,null),m=!0},p(e,[t]){const n={};1&t&&(n.longTitle=e[0]),2&t&&(n.shortTitle=e[1]),a.$set(n)},i(e){m||(Q(a.$$.fragment,e),Q(c.$$.fragment,e),Q(o.$$.fragment,e),m=!0)},o(e){ee(a.$$.fragment,e),ee(c.$$.fragment,e),ee(o.$$.fragment,e),m=!1},d(e){e&&R(t),ie(a),ie(c),ie(o)}}}function ht(e,t,a){let{appLongName:n}=t,{appShortName:c}=t,i=pt;return z((()=>{for(let e=0;e<i[0].races.length;e++)dt(i,e);!function(e){e.sort(((e,t)=>e.races.reduce(((e,t)=>(e="Number"==typeof e?e:0)+t.position))-t.races.reduce(((e,t)=>(e="Number"==typeof e?e:0)+t.position)))),e.forEach(((e,t)=>{e.globalPosition=t}))}(i)})),e.$$set=e=>{"appLongName"in e&&a(0,n=e.appLongName),"appShortName"in e&&a(1,c=e.appShortName)},[n,c,i]}return new class extends re{constructor(e){super(),me(this,e,ht,Rt,o,{appLongName:0,appShortName:1})}}({target:document.body,intro:!0,props:{appLongName:"World Kart Championship",appShortName:"WKC"}})}();
//# sourceMappingURL=bundle.js.map
