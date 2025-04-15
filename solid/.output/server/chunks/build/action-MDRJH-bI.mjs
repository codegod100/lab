import { createContext, createSignal, createMemo, createRenderEffect, on, useContext, runWithOwner, getOwner, startTransition, resetErrorBoundaries, batch, untrack, createComponent, $TRACK, onCleanup, getListener, sharedConfig } from 'solid-js';
import { isServer, getRequestEvent } from 'solid-js/web';

function Se() {
  let e = /* @__PURE__ */ new Set();
  function t(r) {
    return e.add(r), () => e.delete(r);
  }
  let n = false;
  function o(r, s) {
    if (n) return !(n = false);
    const i = { to: r, options: s, defaultPrevented: false, preventDefault: () => i.defaultPrevented = true };
    for (const l of e) l.listener({ ...i, from: l.location, retry: (g) => {
      g && (n = true), l.navigate(r, { ...s, resolve: false });
    } });
    return !i.defaultPrevented;
  }
  return { subscribe: t, confirm: o };
}
let k;
function ie() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), k = window.history.state._depth;
}
isServer || ie();
function nt(e) {
  return { ...e, _depth: window.history.state && window.history.state._depth };
}
function rt(e, t) {
  let n = false;
  return () => {
    const o = k;
    ie();
    const r = o == null ? null : k - o;
    if (n) {
      n = false;
      return;
    }
    r && t(r) ? (n = true, window.history.go(-r)) : e();
  };
}
const Le = /^(?:[a-z0-9]+:)?\/\//i, _e = /^\/+|(\/)\/+$/g, ce = "http://sr";
function B(e, t = false) {
  const n = e.replace(_e, "$1");
  return n ? t || /^[?#]/.test(n) ? n : "/" + n : "";
}
function K(e, t, n) {
  if (Le.test(t)) return;
  const o = B(e), r = n && B(n);
  let s = "";
  return !r || t.startsWith("/") ? s = o : r.toLowerCase().indexOf(o.toLowerCase()) !== 0 ? s = o + r : s = r, (s || "/") + B(t, !s);
}
function je(e, t) {
  if (e == null) throw new Error(t);
  return e;
}
function Be(e, t) {
  return B(e).replace(/\/*(\*.*)?$/g, "") + B(t);
}
function ue(e) {
  const t = {};
  return e.searchParams.forEach((n, o) => {
    o in t ? Array.isArray(t[o]) ? t[o].push(n) : t[o] = [t[o], n] : t[o] = n;
  }), t;
}
function $e(e, t, n) {
  const [o, r] = e.split("/*", 2), s = o.split("/").filter(Boolean), i = s.length;
  return (l) => {
    const g = l.split("/").filter(Boolean), d = g.length - i;
    if (d < 0 || d > 0 && r === void 0 && !t) return null;
    const c = { path: i ? "" : "/", params: {} }, a = (p) => n === void 0 ? void 0 : n[p];
    for (let p = 0; p < i; p++) {
      const f = s[p], w = f[0] === ":", u = w ? g[p] : g[p].toLowerCase(), y = w ? f.slice(1) : f.toLowerCase();
      if (w && H(u, a(y))) c.params[y] = u;
      else if (w || !H(u, y)) return null;
      c.path += `/${u}`;
    }
    if (r) {
      const p = d ? g.slice(-d).join("/") : "";
      if (H(p, a(r))) c.params[r] = p;
      else return null;
    }
    return c;
  };
}
function H(e, t) {
  const n = (o) => o === e;
  return t === void 0 ? true : typeof t == "string" ? n(t) : typeof t == "function" ? t(e) : Array.isArray(t) ? t.some(n) : t instanceof RegExp ? t.test(e) : false;
}
function Me(e) {
  const [t, n] = e.pattern.split("/*", 2), o = t.split("/").filter(Boolean);
  return o.reduce((r, s) => r + (s.startsWith(":") ? 2 : 3), o.length - (n === void 0 ? 0 : 1));
}
function le(e) {
  const t = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(o, r) {
    return t.has(r) || runWithOwner(n, () => t.set(r, createMemo(() => e()[r]))), t.get(r)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(e());
  } });
}
function fe(e) {
  let t = /(\/?\:[^\/]+)\?/.exec(e);
  if (!t) return [e];
  let n = e.slice(0, t.index), o = e.slice(t.index + t[0].length);
  const r = [n, n += t[1]];
  for (; t = /^(\/\:[^\/]+)\?/.exec(o); ) r.push(n += t[1]), o = o.slice(t[0].length);
  return fe(o).reduce((s, i) => [...s, ...r.map((l) => l + i)], []);
}
const De = 100, Ie = createContext(), Te = createContext(), G = () => je(useContext(Ie), "<A> and 'use' router primitives can be only used inside a Route."), We = () => G().navigatorFactory();
function qe(e, t = "") {
  const { component: n, preload: o, load: r, children: s, info: i } = e, l = !s || Array.isArray(s) && !s.length, g = { key: e, component: n, preload: o || r, info: i };
  return he(e.path).reduce((d, c) => {
    for (const a of fe(c)) {
      const p = Be(t, a);
      let f = l ? p : p.split("/*", 1)[0];
      f = f.split("/").map((w) => w.startsWith(":") || w.startsWith("*") ? w : encodeURIComponent(w)).join("/"), d.push({ ...g, originalPath: c, pattern: f, matcher: $e(f, !l, e.matchFilters) });
    }
    return d;
  }, []);
}
function Ue(e, t = 0) {
  return { routes: e, score: Me(e[e.length - 1]) * 1e4 - t, matcher(n) {
    const o = [];
    for (let r = e.length - 1; r >= 0; r--) {
      const s = e[r], i = s.matcher(n);
      if (!i) return null;
      o.unshift({ ...i, route: s });
    }
    return o;
  } };
}
function he(e) {
  return Array.isArray(e) ? e : [e];
}
function Ke(e, t = "", n = [], o = []) {
  const r = he(e);
  for (let s = 0, i = r.length; s < i; s++) {
    const l = r[s];
    if (l && typeof l == "object") {
      l.hasOwnProperty("path") || (l.path = "");
      const g = qe(l, t);
      for (const d of g) {
        n.push(d);
        const c = Array.isArray(l.children) && l.children.length === 0;
        if (l.children && !c) Ke(l.children, d.pattern, n, o);
        else {
          const a = Ue([...n], o.length);
          o.push(a);
        }
        n.pop();
      }
    }
  }
  return n.length ? o : o.sort((s, i) => i.score - s.score);
}
function X(e, t) {
  for (let n = 0, o = e.length; n < o; n++) {
    const r = e[n].matcher(t);
    if (r) return r;
  }
  return [];
}
function He(e, t, n) {
  const o = new URL(ce), r = createMemo((c) => {
    const a = e();
    try {
      return new URL(a, o);
    } catch {
      return console.error(`Invalid path ${a}`), c;
    }
  }, o, { equals: (c, a) => c.href === a.href }), s = createMemo(() => r().pathname), i = createMemo(() => r().search, true), l = createMemo(() => r().hash), g = () => "", d = on(i, () => ue(r()));
  return { get pathname() {
    return s();
  }, get search() {
    return i();
  }, get hash() {
    return l();
  }, get state() {
    return t();
  }, get key() {
    return g();
  }, query: n ? n(d) : le(d) };
}
let O;
function Xe() {
  return O;
}
let _ = false;
function ke() {
  return _;
}
function ot(e) {
  _ = e;
}
function st(e, t, n, o = {}) {
  const { signal: [r, s], utils: i = {} } = e, l = i.parsePath || ((h) => h), g = i.renderPath || ((h) => h), d = i.beforeLeave || Se(), c = K("", o.base || "");
  if (c === void 0) throw new Error(`${c} is not a valid base path`);
  c && !r().value && s({ value: c, replace: true, scroll: false });
  const [a, p] = createSignal(false);
  let f;
  const w = (h, m) => {
    m.value === u() && m.state === R() || (f === void 0 && p(true), O = h, f = m, startTransition(() => {
      f === m && (y(f.value), I(f.state), resetErrorBoundaries(), isServer || J[1]((P) => P.filter((E) => E.pending)));
    }).finally(() => {
      f === m && batch(() => {
        O = void 0, h === "navigate" && ve(f), p(false), f = void 0;
      });
    }));
  }, [u, y] = createSignal(r().value), [R, I] = createSignal(r().state), T = He(u, R, i.queryWrapper), W = [], J = createSignal(isServer ? Pe() : []), Y = createMemo(() => typeof o.transformUrl == "function" ? X(t(), o.transformUrl(T.pathname)) : X(t(), T.pathname)), Q = () => {
    const h = Y(), m = {};
    for (let P = 0; P < h.length; P++) Object.assign(m, h[P].params);
    return m;
  }, me = i.paramsWrapper ? i.paramsWrapper(Q, t) : le(Q), V = { pattern: c, path: () => c, outlet: () => null, resolvePath(h) {
    return K(c, h);
  } };
  return createRenderEffect(on(r, (h) => w("native", h), { defer: true })), { base: V, location: T, params: me, isRouting: a, renderPath: g, parsePath: l, navigatorFactory: ye, matches: Y, beforeLeave: d, preloadRoute: Re, singleFlight: o.singleFlight === void 0 ? true : o.singleFlight, submissions: J };
  function we(h, m, P) {
    untrack(() => {
      if (typeof m == "number") {
        m && (i.go ? i.go(m) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const E = !m || m[0] === "?", { replace: q, resolve: F, scroll: U, state: S } = { replace: false, resolve: !E, scroll: true, ...P }, L = F ? h.resolvePath(m) : K(E && T.pathname || "", m);
      if (L === void 0) throw new Error(`Path '${m}' is not a routable path`);
      if (W.length >= De) throw new Error("Too many redirects");
      const Z = u();
      if (L !== Z || S !== R()) if (isServer) {
        const ee = getRequestEvent();
        ee && (ee.response = { status: 302, headers: new Headers({ Location: L }) }), s({ value: L, replace: q, scroll: U, state: S });
      } else d.confirm(L, P) && (W.push({ value: Z, replace: q, scroll: U, state: R() }), w("navigate", { value: L, state: S }));
    });
  }
  function ye(h) {
    return h = h || useContext(Te) || V, (m, P) => we(h, m, P);
  }
  function ve(h) {
    const m = W[0];
    m && (s({ ...h, replace: m.replace, scroll: m.scroll }), W.length = 0);
  }
  function Re(h, m) {
    const P = X(t(), h.pathname), E = O;
    O = "preload";
    for (let q in P) {
      const { route: F, params: U } = P[q];
      F.component && F.component.preload && F.component.preload();
      const { preload: S } = F;
      _ = true, m && S && runWithOwner(n(), () => S({ params: U, location: { pathname: h.pathname, search: h.search, hash: h.hash, query: ue(h), state: null, key: "" }, intent: "preload" })), _ = false;
    }
    O = E;
  }
  function Pe() {
    const h = getRequestEvent();
    return h && h.router && h.router.submission ? [h.router.submission] : [];
  }
}
function at(e, t, n, o) {
  const { base: r, location: s, params: i } = e, { pattern: l, component: g, preload: d } = o().route, c = createMemo(() => o().path);
  g && g.preload && g.preload(), _ = true;
  const a = d ? d({ params: i, location: s, intent: O || "initial" }) : void 0;
  return _ = false, { parent: t, pattern: l, path: c, outlet: () => g ? createComponent(g, { params: i, location: s, data: a, get children() {
    return n();
  } }) : n(), resolvePath(f) {
    return K(r.path(), f, c());
  } };
}
const ze = "Location", Ne = 5e3, Ge = 18e4;
let $ = /* @__PURE__ */ new Map();
isServer || setInterval(() => {
  const e = Date.now();
  for (let [t, n] of $.entries()) !n[4].count && e - n[0] > Ge && $.delete(t);
}, 3e5);
function M() {
  if (!isServer) return $;
  const e = getRequestEvent();
  if (!e) throw new Error("Cannot find cache context");
  return (e.router || (e.router = {})).cache || (e.router.cache = /* @__PURE__ */ new Map());
}
function Je(e, t = true) {
  return startTransition(() => {
    const n = Date.now();
    de(e, (o) => {
      t && (o[0] = 0), o[4][1](n);
    });
  });
}
function de(e, t) {
  e && !Array.isArray(e) && (e = [e]);
  for (let n of $.keys()) (e === void 0 || pe(n, e)) && t($.get(n));
}
function D(e, t) {
  e.GET && (e = e.GET);
  const n = (...o) => {
    const r = M(), s = Xe(), i = ke(), g = getOwner() ? We() : void 0, d = Date.now(), c = t + z(o);
    let a = r.get(c), p;
    if (isServer) {
      const u = getRequestEvent();
      if (u) {
        const y = (u.router || (u.router = {})).dataOnly;
        if (y) {
          const R = u && (u.router.data || (u.router.data = {}));
          if (R && c in R) return R[c];
          if (Array.isArray(y) && !pe(c, y)) return R[c] = void 0, Promise.resolve();
        }
      }
    }
    if (getListener() && !isServer && (p = true, onCleanup(() => a[4].count--)), a && a[0] && (isServer || s === "native" || a[4].count || Date.now() - a[0] < Ne)) {
      p && (a[4].count++, a[4][0]()), a[3] === "preload" && s !== "preload" && (a[0] = d);
      let u = a[1];
      return s !== "preload" && (u = "then" in a[1] ? a[1].then(w(false), w(true)) : w(false)(a[1]), !isServer && s === "navigate" && startTransition(() => a[4][1](a[0]))), i && "then" in u && u.catch(() => {
      }), u;
    }
    let f;
    if (!isServer && sharedConfig.has && sharedConfig.has(c) ? (f = sharedConfig.load(c), delete globalThis._$HY.r[c]) : f = e(...o), a ? (a[0] = d, a[1] = f, a[3] = s, !isServer && s === "navigate" && startTransition(() => a[4][1](a[0]))) : (r.set(c, a = [d, f, , s, createSignal(d)]), a[4].count = 0), p && (a[4].count++, a[4][0]()), isServer) {
      const u = getRequestEvent();
      if (u && u.router.dataOnly) return u.router.data[c] = f;
    }
    if (s !== "preload" && (f = "then" in f ? f.then(w(false), w(true)) : w(false)(f)), i && "then" in f && f.catch(() => {
    }), isServer && sharedConfig.context && sharedConfig.context.async && !sharedConfig.context.noHydrate) {
      const u = getRequestEvent();
      (!u || !u.serverOnly) && sharedConfig.context.serialize(c, f);
    }
    return f;
    function w(u) {
      return async (y) => {
        if (y instanceof Response) {
          const R = y.headers.get(ze);
          if (R !== null) {
            if (g && R.startsWith("/")) startTransition(() => {
              g(R, { replace: true });
            });
            else if (!isServer) window.location.href = R;
            else if (isServer) {
              const I = getRequestEvent();
              I && (I.response = { status: 302, headers: new Headers({ Location: R }) });
            }
            return;
          }
          y.customBody && (y = await y.customBody());
        }
        if (u) throw y;
        return a[2] = y, y;
      };
    }
  };
  return n.keyFor = (...o) => t + z(o), n.key = t, n;
}
D.get = (e) => M().get(e)[2];
D.set = (e, t) => {
  const n = M(), o = Date.now();
  let r = n.get(e);
  r ? (r[0] = o, r[1] = Promise.resolve(t), r[2] = t, r[3] = "preload") : (n.set(e, r = [o, Promise.resolve(t), t, "preload", createSignal(o)]), r[4].count = 0);
};
D.delete = (e) => M().delete(e);
D.clear = () => M().clear();
function pe(e, t) {
  for (let n of t) if (n && e.startsWith(n)) return true;
  return false;
}
function z(e) {
  return JSON.stringify(e, (t, n) => Ye(n) ? Object.keys(n).sort().reduce((o, r) => (o[r] = n[r], o), {}) : n);
}
function Ye(e) {
  let t;
  return e != null && typeof e == "object" && (!(t = Object.getPrototypeOf(e)) || t === Object.prototype);
}
const te = /* @__PURE__ */ new Map();
function Qe(e, t) {
  const n = G(), o = createMemo(() => n.submissions[0]().filter((r) => r.url === e.base && true));
  return new Proxy([], { get(r, s) {
    return s === $TRACK ? o() : s === "pending" ? o().some((i) => !i.result) : o()[s];
  }, has(r, s) {
    return s in o();
  } });
}
function it(e, t) {
  const n = Qe(e);
  return new Proxy({}, { get(o, r) {
    var _a;
    return n.length === 0 && r === "clear" || r === "retry" ? () => {
    } : (_a = n[n.length - 1]) == null ? void 0 : _a[r];
  } });
}
function ct(e) {
  const t = G();
  return (...n) => e.apply({ r: t }, n);
}
function ut(e, t = {}) {
  function n(...s) {
    const i = this.r, l = this.f, g = (i.singleFlight && e.withOptions ? e.withOptions({ headers: { "X-Single-Flight": "true" } }) : e)(...s), [d, c] = createSignal();
    let a;
    function p(f) {
      return async (w) => {
        var _a;
        const u = await Ze(w, f, i.navigatorFactory());
        let y = null;
        if ((_a = o.onComplete) == null ? void 0 : _a.call(o, { ...a, result: u == null ? void 0 : u.data, error: u == null ? void 0 : u.error, pending: false, retry() {
          return y = a.retry();
        } }), y) return y;
        if (!u) return a.clear();
        if (c(u), u.error && !l) throw u.error;
        return u.data;
      };
    }
    return i.submissions[1]((f) => [...f, a = { input: s, url: r, get result() {
      var _a;
      return (_a = d()) == null ? void 0 : _a.data;
    }, get error() {
      var _a;
      return (_a = d()) == null ? void 0 : _a.error;
    }, get pending() {
      return !d();
    }, clear() {
      i.submissions[1]((w) => w.filter((u) => u !== a));
    }, retry() {
      return c(void 0), e(...s).then(p(), p(true));
    } }]), g.then(p(), p(true));
  }
  const o = typeof t == "string" ? { name: t } : t, r = e.url || o.name && `https://action/${o.name}` || (isServer ? "" : `https://action/${Ve(e.toString())}`);
  return n.base = r, ge(n, r);
}
function ge(e, t) {
  return e.toString = () => {
    if (!t) throw new Error("Client Actions need explicit names if server rendered");
    return t;
  }, e.with = function(...n) {
    const o = function(...s) {
      return e.call(this, ...n, ...s);
    };
    o.base = e.base;
    const r = new URL(t, ce);
    return r.searchParams.set("args", z(n)), ge(o, (r.origin === "https://action" ? r.origin : "") + r.pathname + r.search);
  }, e.url = t, isServer || (te.set(t, e), getOwner() && onCleanup(() => te.delete(t))), e;
}
const Ve = (e) => e.split("").reduce((t, n) => (t << 5) - t + n.charCodeAt(0) | 0, 0);
async function Ze(e, t, n) {
  let o, r, s, i;
  if (e instanceof Response) {
    if (e.headers.has("X-Revalidate") && (s = e.headers.get("X-Revalidate").split(",")), e.customBody && (o = r = await e.customBody(), e.headers.has("X-Single-Flight") && (o = o._$value, delete r._$value, i = Object.keys(r))), e.headers.has("Location")) {
      const l = e.headers.get("Location") || "/";
      l.startsWith("http") ? window.location.href = l : n(l);
    }
  } else {
    if (t) return { error: e };
    o = e;
  }
  return de(s, (l) => l[0] = 0), i && i.forEach((l) => D.set(l, r[l])), await Je(s, false), o != null ? { data: o } : void 0;
}

export { Ie as I, Ke as K, Se as S, Te as T, Xe as X, ce as a, at as b, ct as c, X as d, ie as e, it as i, nt as n, ot as o, rt as r, st as s, te as t, ut as u };
//# sourceMappingURL=action-MDRJH-bI.mjs.map
