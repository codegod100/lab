import { createComponent, isServer, ssr, ssrHydrationKey, escape, getRequestEvent, delegateEvents } from 'solid-js/web';
import { I, k } from './index-BdnVf8ln.mjs';
import { y as ys } from '../nitro/nitro.mjs';
import { Suspense, createSignal, onCleanup, children, createMemo, getOwner, sharedConfig, untrack, Show, on, createRoot } from 'solid-js';
import { K as Ke, s as st$1, I as Ie, a as ce, t as te, X as Xe, b as at, d as X, T as Te, o as ot, S as Se, n as nt, e as ie, r as rt } from './action-MDRJH-bI.mjs';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:url';
import 'node:net';
import 'node:fs';
import 'node:path';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'solid-js/web/storage';
import 'node:async_hooks';

const j = (t) => (r) => {
  const { base: a } = r, n = children(() => r.children), e = createMemo(() => Ke(n(), r.base || ""));
  let i;
  const c = st$1(t, e, () => i, { base: a, singleFlight: r.singleFlight, transformUrl: r.transformUrl });
  return t.create && t.create(c), createComponent(Ie.Provider, { value: c, get children() {
    return createComponent(st, { routerState: c, get root() {
      return r.root;
    }, get preload() {
      return r.rootPreload || r.rootLoad;
    }, get children() {
      return [(i = getOwner()) && null, createComponent(it, { routerState: c, get branches() {
        return e();
      } })];
    } });
  } });
};
function st(t) {
  const r = t.routerState.location, a = t.routerState.params, n = createMemo(() => t.preload && untrack(() => {
    ot(true), t.preload({ params: a, location: r, intent: Xe() || "initial" }), ot(false);
  }));
  return createComponent(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (e) => createComponent(e, { params: a, location: r, get data() {
    return n();
  }, get children() {
    return t.children;
  } }) });
}
function it(t) {
  if (isServer) {
    const e = getRequestEvent();
    if (e && e.router && e.router.dataOnly) {
      ct(e, t.routerState, t.branches);
      return;
    }
    e && ((e.router || (e.router = {})).matches || (e.router.matches = t.routerState.matches().map(({ route: i, path: c, params: m }) => ({ path: i.originalPath, pattern: i.pattern, match: c, params: m, info: i.info }))));
  }
  const r = [];
  let a;
  const n = createMemo(on(t.routerState.matches, (e, i, c) => {
    let m = i && e.length === i.length;
    const f = [];
    for (let l = 0, w = e.length; l < w; l++) {
      const b = i && i[l], g = e[l];
      c && b && g.route.key === b.route.key ? f[l] = c[l] : (m = false, r[l] && r[l](), createRoot((v) => {
        r[l] = v, f[l] = at(t.routerState, f[l - 1] || t.routerState.base, O(() => n()[l + 1]), () => t.routerState.matches()[l]);
      }));
    }
    return r.splice(e.length).forEach((l) => l()), c && m ? c : (a = f[0], f);
  }));
  return O(() => n() && a)();
}
const O = (t) => () => createComponent(Show, { get when() {
  return t();
}, keyed: true, children: (r) => createComponent(Te.Provider, { value: r, get children() {
  return r.outlet();
} }) });
function ct(t, r, a) {
  const n = new URL(t.request.url), e = X(a, new URL(t.router.previousUrl || t.request.url).pathname), i = X(a, n.pathname);
  for (let c = 0; c < i.length; c++) {
    (!e[c] || i[c].route !== e[c].route) && (t.router.dataOnly = true);
    const { route: m, params: f } = i[c];
    m.preload && m.preload({ params: f, location: r.location, intent: "preload" });
  }
}
function ut([t, r], a, n) {
  return [t, n ? (e) => r(n(e)) : r];
}
function lt(t) {
  let r = false;
  const a = (e) => typeof e == "string" ? { value: e } : e, n = ut(createSignal(a(t.get()), { equals: (e, i) => e.value === i.value && e.state === i.state }), void 0, (e) => (!r && t.set(e), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), e));
  return t.init && onCleanup(t.init((e = t.get()) => {
    r = true, n[1](a(e)), r = false;
  })), j({ signal: n, create: t.create, utils: t.utils });
}
function dt(t, r, a) {
  return t.addEventListener(r, a), () => t.removeEventListener(r, a);
}
function ht(t, r) {
  const a = t && document.getElementById(t);
  a ? a.scrollIntoView() : r && window.scrollTo(0, 0);
}
function ft(t) {
  const r = new URL(t);
  return r.pathname + r.search;
}
function mt(t) {
  let r;
  const a = { value: t.url || (r = getRequestEvent()) && ft(r.request.url) || "" };
  return j({ signal: [() => a, (n) => Object.assign(a, n)] })(t);
}
function gt(t = true, r = false, a = "/_server", n) {
  return (e) => {
    const i = e.base.path(), c = e.navigatorFactory(e.base);
    let m, f;
    function l(o) {
      return o.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(o) {
      if (o.defaultPrevented || o.button !== 0 || o.metaKey || o.altKey || o.ctrlKey || o.shiftKey) return;
      const s = o.composedPath().find((E) => E instanceof Node && E.nodeName.toUpperCase() === "A");
      if (!s || r && !s.hasAttribute("link")) return;
      const d = l(s), u = d ? s.href.baseVal : s.href;
      if ((d ? s.target.baseVal : s.target) || !u && !s.hasAttribute("state")) return;
      const p = (s.getAttribute("rel") || "").split(/\s+/);
      if (s.hasAttribute("download") || p && p.includes("external")) return;
      const y = d ? new URL(u, document.baseURI) : new URL(u);
      if (!(y.origin !== window.location.origin || i && y.pathname && !y.pathname.toLowerCase().startsWith(i.toLowerCase()))) return [s, y];
    }
    function b(o) {
      const s = w(o);
      if (!s) return;
      const [d, u] = s, A = e.parsePath(u.pathname + u.search + u.hash), p = d.getAttribute("state");
      o.preventDefault(), c(A, { resolve: false, replace: d.hasAttribute("replace"), scroll: !d.hasAttribute("noscroll"), state: p ? JSON.parse(p) : void 0 });
    }
    function g(o) {
      const s = w(o);
      if (!s) return;
      const [d, u] = s;
      n && (u.pathname = n(u.pathname)), e.preloadRoute(u, d.getAttribute("preload") !== "false");
    }
    function v(o) {
      clearTimeout(m);
      const s = w(o);
      if (!s) return f = null;
      const [d, u] = s;
      f !== d && (n && (u.pathname = n(u.pathname)), m = setTimeout(() => {
        e.preloadRoute(u, d.getAttribute("preload") !== "false"), f = d;
      }, 20));
    }
    function S(o) {
      if (o.defaultPrevented) return;
      let s = o.submitter && o.submitter.hasAttribute("formaction") ? o.submitter.getAttribute("formaction") : o.target.getAttribute("action");
      if (!s) return;
      if (!s.startsWith("https://action/")) {
        const u = new URL(s, ce);
        if (s = e.parsePath(u.pathname + u.search), !s.startsWith(a)) return;
      }
      if (o.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const d = te.get(s);
      if (d) {
        o.preventDefault();
        const u = new FormData(o.target, o.submitter);
        d.call({ r: e, f: o.target }, o.target.enctype === "multipart/form-data" ? u : new URLSearchParams(u));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", b), t && (document.addEventListener("mousemove", v, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", S), onCleanup(() => {
      document.removeEventListener("click", b), t && (document.removeEventListener("mousemove", v), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", S);
    });
  };
}
function wt(t) {
  if (isServer) return mt(t);
  const r = () => {
    const n = window.location.pathname.replace(/^\/+/, "/") + window.location.search, e = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: n + window.location.hash, state: e };
  }, a = Se();
  return lt({ get: r, set({ value: n, replace: e, scroll: i, state: c }) {
    e ? window.history.replaceState(nt(c), "", n) : window.history.pushState(c, "", n), ht(decodeURIComponent(window.location.hash.slice(1)), i), ie();
  }, init: (n) => dt(window, "popstate", rt(n, (e) => {
    if (e && e < 0) return !a.confirm(e);
    {
      const i = r();
      return !a.confirm(i.value, { state: i.state });
    }
  })), create: gt(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (n) => window.history.go(n), beforeLeave: a } })(t);
}
var bt = ["<nav", ' class="flex items-center justify-between flex-wrap bg-gray-800 p-4 shadow-md"><div class="text-white font-bold text-xl">MyApp</div><div class="space-x-4"><a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a><a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a></div></nav>'], pt = ["<div", ">", "</div>"];
function vt(t) {
  return [ssr(bt, ssrHydrationKey()), ssr(pt, ssrHydrationKey(), escape(t.children))];
}
function Ct() {
  return createComponent(wt, { root: (t) => createComponent(I, { get children() {
    return [createComponent(k, { children: "SolidStart - Basic" }), createComponent(vt, { get children() {
      return createComponent(Suspense, { get children() {
        return t.children;
      } });
    } })];
  } }), get children() {
    return createComponent(ys, {});
  } });
}

export { Ct as default };
//# sourceMappingURL=app-BQX5r7Jd.mjs.map
