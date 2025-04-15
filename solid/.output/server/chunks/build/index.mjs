import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-BdnVf8ln.mjs';
import { createSignal, Show } from 'solid-js';
import { E } from './server-fns-runtime-DK5g-_sR.mjs';
import { c as ct, i as it, u as ut } from './action-MDRJH-bI.mjs';
import 'solid-js/web/storage';
import '../nitro/nitro.mjs';
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

const p = E(async (t) => (console.log(t), t), "src_backend_ts--foo_action", "/var/home/v/lab/solid/src/backend.ts?tsr-directive-use-server="), s = ut(p);
var g = ["<button", ' class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring focus:ring-blue-300" type="button">Clicks: <!--$-->', "<!--/--> <!--$-->", "<!--/--></button>"];
function f() {
  const [t, x] = createSignal(0);
  ct(s)(0);
  const r = it(s);
  return ssr(g, ssrHydrationKey(), escape(t()), escape(createComponent(Show, { get when() {
    return r.result;
  }, get children() {
    return ["blicks: ", r.result, " "];
  } })));
}
var h = ["<main", ' class="max-w-4xl mx-auto p-6 md:p-10 lg:p-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-10"><!--$-->', '<!--/--><h1 class="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Hello world!</h1><div class="mb-6 p-4 border border-dashed border-gray-300 rounded-lg hover:shadow transition-shadow duration-300">', '</div><p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">Visit <a href="https://start.solidjs.com" target="_blank" class="text-blue-600 hover:text-blue-800 underline font-medium">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>'];
function F() {
  return ssr(h, ssrHydrationKey(), escape(createComponent(k, { children: "Hello World" })), escape(createComponent(f, {})));
}

export { F as default };
//# sourceMappingURL=index.mjs.map
