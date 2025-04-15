import { ssr, ssrHydrationKey, escape, createComponent, getRequestEvent } from 'solid-js/web';
import { k as k$1, h as hn, f as fn, a as dn, r as rn } from '../nitro/nitro.mjs';
import { createSignal, Show } from 'solid-js';
import { provideRequestEvent } from 'solid-js/web/storage';
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
import 'node:async_hooks';

function C(t, n, s) {
  if (typeof t != "function") throw new Error("Export from a 'use server' module must be a function");
  const r = "";
  return new Proxy(t, { get(u, e, a) {
    return e === "url" ? `${r}/_server?id=${encodeURIComponent(n)}&name=${encodeURIComponent(s)}` : e === "GET" ? a : u[e];
  }, apply(u, e, a) {
    const c = getRequestEvent();
    if (!c) throw new Error("Cannot call server function outside of a request");
    const l = rn(c);
    return l.locals.serverFunctionMeta = { id: n + "#" + s }, l.serverOnly = true, provideRequestEvent(l, () => t.apply(e, a));
  } });
}
const E = C(async (t) => (console.log(t), t), "src_backend_ts--foo_action", "/var/home/v/lab/solid/src/backend.ts?tsr-directive-use-server="), d = dn(E);
var _ = ["<button", ' class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring focus:ring-blue-300" type="button">Clicks: <!--$-->', "<!--/--> <!--$-->", "<!--/--></button>"];
function k() {
  const [t, n] = createSignal(0);
  hn(d)(0);
  const r = fn(d);
  return ssr(_, ssrHydrationKey(), escape(t()), escape(createComponent(Show, { get when() {
    return r.result;
  }, get children() {
    return ["blicks: ", r.result, " "];
  } })));
}
var R = ["<main", ' class="max-w-4xl mx-auto p-6 md:p-10 lg:p-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-10"><!--$-->', '<!--/--><h1 class="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Hello world!</h1><div class="mb-6 p-4 border border-dashed border-gray-300 rounded-lg hover:shadow transition-shadow duration-300">', '</div><p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">Visit <a href="https://start.solidjs.com" target="_blank" class="text-blue-600 hover:text-blue-800 underline font-medium">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>'];
function I() {
  return ssr(R, ssrHydrationKey(), escape(createComponent(k$1, { children: "Hello World" })), escape(createComponent(k, {})));
}

export { I as default };
//# sourceMappingURL=index2.mjs.map
