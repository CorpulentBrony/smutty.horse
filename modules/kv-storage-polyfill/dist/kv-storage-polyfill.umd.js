!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(t.kvStoragePolyfill={})}(this,function(t){const n=function(){function t(){}return t.prototype.then=function(n,r){const o=new t,i=this.s;if(i){const t=1&i?n:r;if(t){try{e(o,1,t(this.v))}catch(t){e(o,2,t)}return o}return this}return this.o=function(t){try{const i=t.v;1&t.s?e(o,1,n?n(i):i):r?e(o,1,r(i)):e(o,2,i)}catch(t){e(o,2,t)}},o},t}();function e(t,r,o){if(!t.s){if(o instanceof n){if(!o.s)return void(o.o=e.bind(null,t,r));1&r&&(r=o.s),o=o.v}if(o&&o.then)return void o.then(e.bind(null,t,r),e.bind(null,t,2));t.s=r,t.v=o;const i=t.o;i&&i(t)}}const r={};!function(){function t(t){this._entry=t,this._pact=null,this._resolve=null,this._return=null,this._promise=null}function o(t){return{value:t,done:!0}}function i(t){return{value:t,done:!1}}t.prototype[Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator"))]=function(){return this},t.prototype._yield=function(t){return this._resolve(t&&t.then?t.then(i):i(t)),this._pact=new n},t.prototype.next=function(t){const i=this;return i._promise=new Promise(function(u){const s=i._pact;if(null===s){const t=i._entry;if(null===t)return u(i._promise);function c(t){i._resolve(t&&t.then?t.then(o):o(t)),i._pact=null,i._resolve=null}i._entry=null,i._resolve=u,t(i).then(c,function(t){if(t===r)c(i._return);else{const e=new n;i._resolve(e),i._pact=null,i._resolve=null,_resolve(e,2,t)}})}else i._pact=null,i._resolve=u,e(s,1,t)})},t.prototype.return=function(t){const n=this;return n._promise=new Promise(function(i){const u=n._pact;if(null===u)return null===n._entry?i(n._promise):(n._entry=null,i(t&&t.then?t.then(o):o(t)));n._return=t,n._resolve=i,n._pact=null,e(u,2,r)})},t.prototype.throw=function(t){const n=this;return n._promise=new Promise(function(r,o){const i=n._pact;if(null===i)return null===n._entry?r(n._promise):(n._entry=null,o(t));n._resolve=r,n._pact=null,e(i,2,t)})}}();var o=0,i="function"==typeof WeakMap?WeakMap:function(){var t="function"==typeof Symbol?Symbol(0):"__weak$"+ ++o;this.set=function(n,e){n[t]=e},this.get=function(n){return n[t]}};function u(t){return new Promise(function(n,e){t.onsuccess=function(){n(t.result)},t.onerror=function(){e(t.error)}})}function s(t){return new Promise(function(n,e){t.oncomplete=function(){n()},t.onabort=function(){e(t.error)},t.onerror=function(){e(t.error)}})}function c(t){if(!function(t){if("number"==typeof t||"string"==typeof t)return!0;if("object"==typeof t&&t){if(Array.isArray(t))return!0;if("setUTCFullYear"in t)return!0;if("function"==typeof ArrayBuffer&&ArrayBuffer.isView(t))return!0;if("byteLength"in t&&"length"in t)return!0}return!1}(t))throw Error("kv-storage: The given value is not allowed as a key")}var f={};function a(t,n){return function(t,n){var e=t.getKey(n),r=t.get(n);return new Promise(function(t,n){e.onerror=function(){n(e.error)},r.onerror=function(){n(r.error)},r.onsuccess=function(){t([e.result,r.result])}})}(t,l(n))}function l(t){return t===f?IDBKeyRange.lowerBound(-Infinity):IDBKeyRange.lowerBound(t,!0)}var v=new i,h=new i,y=new i,p=new i,d=function(){};function m(t,r){return r(function(r,o){try{function i(){return h.set(t,c),y.set(t,void 0),{value:v,done:void 0===c}}var s=h.get(t);if(void 0===s)return Promise.resolve({value:void 0,done:!0});var c,f,v,d=function(t,r){var o,i=-1;t:{for(var u=0;u<r.length;u++){var s=r[u][0];if(s){var c=s();if(c&&c.then)break t;if(c===t){i=u;break}}else i=u}if(-1!==i){do{for(var f=r[i][1];!f;)f=r[++i][1];var a=f();if(a&&a.then){o=!0;break t}var l=r[i][2];i++}while(l&&!l());return a}}const v=new n,h=e.bind(null,v,2);return(o?a.then(y):c.then(function n(o){for(;;){if(o===t){i=u;break}if(++u===r.length){if(-1!==i)break;return void e(v,1,f)}if(s=r[u][0]){if((o=s())&&o.then)return void o.then(n).then(void 0,h)}else i=u}do{for(var c=r[i][1];!c;)c=r[++i][1];var f=c();if(f&&f.then)return void f.then(y).then(void 0,h);var a=r[i][2];i++}while(a&&!a());e(v,1,f)})).then(void 0,h),v;function y(t){for(;;){var n=r[i][2];if(!n||n())break;for(var o=r[++i][1];!o;)o=r[++i][1];if((t=o())&&t.then)return void t.then(y).then(void 0,h)}e(v,1,t)}}(p.get(t),[[function(){return"keys"},function(){return Promise.resolve(function(t,n){var e=l(n);return u(t.getKey(e))}(o,s)).then(function(t){v=c=t})}],[function(){return"values"},function(){return Promise.resolve(a(o,s)).then(function(t){var n;c=(n=t)[0],v=f=n[1]})}],[function(){return"entries"},function(){return Promise.resolve(a(o,s)).then(function(t){var n;f=(n=t)[1],v=void 0===(c=n[0])?void 0:[c,f]})}]]);return Promise.resolve(d&&d.then?d.then(i):i())}catch(t){return Promise.reject(t)}})}function _(t,n){var e=new d;return p.set(e,t),v.set(e,n),h.set(e,f),y.set(e,void 0),e}d.prototype.return=function(){h.set(this,void 0)},d.prototype.next=function(){var t=this,n=v.get(this);if(!n)return Promise.reject(new TypeError("Invalid this value"));var e,r=y.get(this);return e=void 0!==r?r.then(function(){return m(t,n)}):m(this,n),y.set(this,e),e},"function"==typeof Symbol&&Symbol.asyncIterator&&(d.prototype[Symbol.asyncIterator]=function(){return this});var b=function(t,n,e){try{return null===w.get(t)&&function(t){var n=g.get(t);w.set(t,new Promise(function(e,r){var o=self.indexedDB.open(n,1);o.onsuccess=function(){var i=o.result;(function(t,n,e){if(1!==t.objectStoreNames.length)return e(j(n)),!1;if(t.objectStoreNames[0]!==P)return e(j(n)),!1;var r=t.transaction(P,"readonly").objectStore(P);return!(r.autoIncrement||r.keyPath||r.indexNames.length)||(e(j(n)),!1)})(i,n,r)&&(i.onclose=function(){w.set(t,null)},i.onversionchange=function(){i.close(),w.set(t,null)},e(i))},o.onerror=function(){return r(o.error)},o.onupgradeneeded=function(){try{o.result.createObjectStore(P)}catch(t){r(t)}}}))}(t),Promise.resolve(w.get(t)).then(function(t){var r=t.transaction(P,n),o=r.objectStore(P);return e(r,o)})}catch(t){return Promise.reject(t)}},g=new i,w=new i,P="store",S=function(t){var n="kv-storage:"+t;w.set(this,null),g.set(this,n),this.backingStore={database:n,store:P,version:1}};S.prototype.set=function(t,n){try{return c(t),b(this,"readwrite",function(e,r){return void 0===n?r.delete(t):r.put(n,t),s(e)})}catch(t){return Promise.reject(t)}},S.prototype.get=function(t){try{return c(t),b(this,"readonly",function(n,e){return u(e.get(t))})}catch(t){return Promise.reject(t)}},S.prototype.delete=function(t){try{return c(t),b(this,"readwrite",function(n,e){return e.delete(t),s(n)})}catch(t){return Promise.reject(t)}},S.prototype.clear=function(){try{var t=this;function n(){return u(self.indexedDB.deleteDatabase(t._databaseName))}var e=w.get(t),r=function(){if(null!==e){function n(){t._databasePromise=null}var r=function(t,n){try{var r=Promise.resolve(e).then(function(){})}catch(t){return}return r&&r.then?r.then(void 0,function(){}):r}();return r&&r.then?r.then(n):n()}}();return r&&r.then?r.then(n):n()}catch(t){return Promise.reject(t)}},S.prototype.keys=function(){var t=this;return _("keys",function(n){return b(t,"readonly",n)})},S.prototype.values=function(){var t=this;return _("values",function(n){return b(t,"readonly",n)})},S.prototype.entries=function(){var t=this;return _("entries",function(n){return b(t,"readonly",n)})},"function"==typeof Symbol&&Symbol.asyncIterator&&(S.prototype[Symbol.asyncIterator]=S.prototype.entries);var k=new S("default");function j(t){return new Error('kv-storage: database "'+t+'" corrupted')}t.StorageArea=S,t.storage=k});
//# sourceMappingURL=kv-storage-polyfill.umd.js.map
