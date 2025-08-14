var te = Object.defineProperty, ne = Object.defineProperties, re = Object.getOwnPropertyDescriptors, z = Object.getOwnPropertySymbols, oe = Object.prototype.hasOwnProperty, ae = Object.prototype.propertyIsEnumerable, q = (t, o, i) => o in t ? te(t, o, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[o] = i, se = (t, o) => {
  for (var i in o || (o = {})) oe.call(o, i) && q(t, i, o[i]);
  if (z) for (var i of z(o)) ae.call(o, i) && q(t, i, o[i]);
  return t;
}, ie = (t, o) => ne(t, re(o));
(function() {
  if ("adoptedStyleSheets" in document) return;
  var t = "ShadyCSS" in window && !window.ShadyCSS.nativeShadow, o = [], i = [], m = /* @__PURE__ */ new WeakMap(), u = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), b = /* @__PURE__ */ new WeakMap(), C = /* @__PURE__ */ new WeakMap(), F = { loaded: !1 }, f = { body: null, CSSStyleSheet: null }, D = CSSStyleSheet, B = /@import\surl(.*?);/gi;
  function R(e) {
    return e instanceof D || e instanceof f.CSSStyleSheet;
  }
  function G(e, r) {
    var n = r === document ? "Document" : "ShadowRoot";
    if (!Array.isArray(e)) throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + n + ": Iterator getter is not callable.");
    if (!e.every(R)) throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + n + ": Failed to convert value to 'CSSStyleSheet'");
    var a = e.filter(function(s, c) {
      return e.indexOf(s) === c;
    });
    return m.set(r, a), a;
  }
  function x() {
    return document.readyState === "loading";
  }
  function H(e) {
    return m.get(e.parentNode === document.documentElement ? document : e);
  }
  function _(e) {
    var r = e.match(B, "") || [], n = e;
    return r.length && (console.warn("@import rules are not allowed here. See https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418"), r.forEach(function(a) {
      n = n.replace(a, "");
    })), n;
  }
  var U = ["addImport", "addPageRule", "addRule", "deleteRule", "insertRule", "removeImport", "removeRule"], J = ["replace", "replaceSync"];
  function A(e) {
    J.forEach(function(r) {
      e[r] = function() {
        return E.prototype[r].apply(this, arguments);
      };
    }), U.forEach(function(r) {
      var n = e[r];
      e[r] = function() {
        var a = arguments, s = n.apply(this, a);
        if (u.has(this)) {
          var c = u.get(this), l = c.adopters, p = c.actions;
          l.forEach(function(h) {
            h.sheet && h.sheet[r].apply(h.sheet, a);
          }), p.push([r, a]);
        }
        return s;
      };
    });
  }
  function j(e) {
    var r = u.get(e), n = r.adopters, a = r.basicStyleElement;
    n.forEach(function(s) {
      s.innerHTML = a.innerHTML;
    });
  }
  var E = (function() {
    function e() {
      var n = document.createElement("style");
      F.loaded ? f.body.appendChild(n) : (document.head.appendChild(n), n.disabled = !0, o.push(n));
      var a = n.sheet;
      return u.set(a, { adopters: /* @__PURE__ */ new Map(), actions: [], basicStyleElement: n }), a;
    }
    var r = e.prototype;
    return r.replace = function(n) {
      var a = this, s = _(n);
      return new Promise(function(c, l) {
        if (u.has(a)) {
          var p = u.get(a), h = p.basicStyleElement;
          h.innerHTML = s, c(h.sheet), j(a);
        } else l(new Error("Can't call replace on non-constructed CSSStyleSheets."));
      });
    }, r.replaceSync = function(n) {
      var a = _(n);
      if (u.has(this)) {
        var s = u.get(this), c = s.basicStyleElement;
        return c.innerHTML = a, j(this), c.sheet;
      } else throw new Error("Failed to execute 'replaceSync' on 'CSSStyleSheet': Can't call replaceSync on non-constructed CSSStyleSheets.");
    }, e;
  })();
  Object.defineProperty(E, Symbol.hasInstance, { configurable: !0, value: R });
  function M(e) {
    for (var r = document.createDocumentFragment(), n = H(e), a = b.get(e), s = 0, c = n.length; s < c; s++) {
      var l = u.get(n[s]), p = l.adopters, h = l.basicStyleElement, d = p.get(e);
      d ? (a.disconnect(), r.appendChild(d), (!d.innerHTML || d.sheet && !d.sheet.cssText) && (d.innerHTML = h.innerHTML), a.observe()) : (d = document.createElement("style"), d.innerHTML = h.innerHTML, k.set(d, e), C.set(d, 0), p.set(e, d), r.appendChild(d)), e === document.head && i.push(d);
    }
    e.insertBefore(r, e.firstChild);
    for (var y = 0, P = n.length; y < P; y++) {
      var S = u.get(n[y]), v = S.adopters, g = S.actions, w = v.get(e), V = C.get(w);
      if (g.length > 0) {
        for (var O = V, X = g.length; O < X; O++) {
          var W = g[O], Q = W[0], ee = W[1];
          w.sheet[Q].apply(w.sheet, ee);
        }
        C.set(w, g.length - 1);
      }
    }
  }
  function K(e, r) {
    for (var n = H(e), a = 0, s = r.length; a < s; a++) if (!(n.indexOf(r[a]) > -1)) {
      var c = u.get(r[a]), l = c.adopters, p = b.get(e), h = l.get(e);
      h || (h = l.get(document.head)), p.disconnect(), h.parentNode.removeChild(h), p.observe();
    }
  }
  function Y(e) {
    for (var r = 0, n = e.length; r < n; r++) {
      for (var a = e[r], s = a.addedNodes, c = a.removedNodes, l = 0, p = c.length; l < p; l++) {
        var h = k.get(c[l]);
        h && M(h);
      }
      if (!t) for (var d = 0, y = s.length; d < y; d++) for (var P = document.createNodeIterator(s[d], NodeFilter.SHOW_ELEMENT, function(v) {
        return v.shadowRoot && v.shadowRoot.adoptedStyleSheets.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }, null, !1), S = void 0; S = P.nextNode(); ) M(S.shadowRoot);
    }
  }
  function I(e) {
    var r = new MutationObserver(Y), n = { observe: function() {
      r.observe(e, { childList: !0, subtree: !0 });
    }, disconnect: function() {
      r.disconnect();
    } };
    b.set(e, n), n.observe();
  }
  function N() {
    var e = document.createElement("iframe");
    e.hidden = !0, document.body.appendChild(e), f.body = e.contentWindow.document.body, f.CSSStyleSheet = e.contentWindow.CSSStyleSheet, A(e.contentWindow.CSSStyleSheet.prototype), I(document.body), F.loaded = !0;
    for (var r = document.createDocumentFragment(), n = 0, a = o.length; n < a; n++) o[n].disabled = !1, r.appendChild(o[n]);
    f.body.appendChild(r);
    for (var s = 0, c = i.length; s < c; s++) r.appendChild(i[s]);
    document.body.insertBefore(r, document.body.firstChild), o.length = 0, i.length = 0;
  }
  function Z() {
    var e = { configurable: !0, get: function() {
      return m.get(this) || [];
    }, set: function(n) {
      var a = m.get(this) || [];
      G(n, this);
      var s = this === document ? x() ? this.head : this.body : this, c = "isConnected" in s ? s.isConnected : document.body.contains(s);
      window.requestAnimationFrame(function() {
        c && (M(s), K(s, a));
      });
    } };
    if (Object.defineProperty(Document.prototype, "adoptedStyleSheets", e), typeof ShadowRoot < "u") {
      var r = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function() {
        var n = t ? this : r.apply(this, arguments);
        return I(n), n;
      }, Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", e);
    }
  }
  A(D.prototype), window.CSSStyleSheet = E, Z(), x() ? document.addEventListener("DOMContentLoaded", N) : N();
})();
function ce(t) {
  return t.replace(/(-)([a-z])/g, (o) => o[1].toUpperCase());
}
function he(t) {
  return t.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function de(t) {
  return t ? Array.from(t).reduce((o, { localName: i, value: m }) => ie(se({}, o), { [ce(i)]: m }), {}) : {};
}
function $(t) {
  return document.createRange().createContextualFragment(t);
}
var T = {}, le = {}, ue = class extends HTMLElement {
  constructor(t) {
    super(), t ? this.componentPath = t : (console.warn("You did not send a path to the super method in your constructor. Thus CSS and HTML cannot be read for this component.", this), console.warn("If shipping for modern browser, then call super with import.meta.url. If not, specify a path that is similar to import.meta.url yourself."), console.warn("Should be the path to the component you are making."));
  }
  $(t) {
    return this._sDOM.querySelector(t);
  }
  get cssPath() {
    return this.componentPath && this.componentPath.replace(/\.(html|js)/gi, ".css");
  }
  get htmlPath() {
    return this.componentPath && this.componentPath.replace(/\.(css|js)/gi, ".html");
  }
  get props() {
    return de(this.attributes);
  }
  async _render() {
    if (!le[this.cssPath] && this.cssPath) {
      let o = await this.fetchCSSAsStyleSheet();
      this._sDOM.adoptedStyleSheets = [o];
    }
    let t = this.render(this.props);
    return $(t);
  }
  async fetchHTMLAsDocFrag() {
    let t = await fetch(this.htmlPath);
    if (t.ok) {
      let o = await t.text();
      return $(o);
    }
    throw new Error("Fetch failed");
  }
  async fetchCSSAsStyleSheet() {
    let t = new CSSStyleSheet(), o = await fetch(this.cssPath);
    if (o.ok && o.headers.get("content-type").indexOf("text/css") !== -1) {
      let i = await o.text();
      await t.replace(i);
    }
    return t;
  }
  async _renderHTMLFile() {
    let t = btoa(this.componentPath);
    T[t] || (T[t] = Promise.all([this.fetchHTMLAsDocFrag(), this.fetchCSSAsStyleSheet()]));
    let [o, i] = await T[t];
    return this._sDOM.adoptedStyleSheets = [i], o.cloneNode(!0);
  }
  componentDidMount() {
  }
  async connectedCallback() {
    this._sDOM = this.attachShadow({ mode: "closed" });
    let t;
    this.render ? t = await this._render() : this.componentPath ? t = await this._renderHTMLFile() : console.error("No render function or component path found for static html/css."), this._sDOM.innerHTML = null, this._sDOM.appendChild(t), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.componentDidMount && this.componentDidMount();
      });
    });
  }
};
function pe(t, { name: o } = { name: void 0 }) {
  let i = "is" in t ? t.is : t.prototype.constructor.name, m = o || he(i);
  return customElements.define(m, t), m;
}
class me extends ue {
  constructor() {
    super(import.meta.url), this._loaded = !1;
  }
  get leafletMap() {
    return this.map;
  }
  componentDidMount() {
    this.map = L.map(this.$("#map"), {
      crs: L.CRS.EPSG3857,
      continuousWorld: !0,
      center: [59.9573174, 15.4233244],
      zoom: 6
    });
    const o = L.tileLayer.wms(
      "https://mapslantmateriet.havochvatten.se/topowebb/wms/v1?",
      {
        layers: "topowebbkartan",
        detectRetina: !0
      }
    );
    this.map.addLayer(o), window.dispatchEvent(new Event("resize")), document.dispatchEvent(new CustomEvent("map:ready"));
  }
  render() {
    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
        integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
        crossorigin=""/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
      <style>
      :host,
      #map {
        display: block;
        width: 100%;
        height: 100%;
      }
      </style>
      <div id="map" data-tap-disabled="true"></div>
    `;
  }
}
const fe = pe(me, {
  name: "lantmateriet-karta"
});
export {
  fe as default
};
