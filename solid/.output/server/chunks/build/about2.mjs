import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from '../nitro/nitro.mjs';
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
import 'solid-js';
import 'solid-js/web/storage';
import 'node:async_hooks';

var i = ["<main", "><!--$-->", "<!--/--><h1>About</h1></main>"];
function s() {
  return ssr(i, ssrHydrationKey(), escape(createComponent(k, { children: "About" })));
}

export { s as default };
//# sourceMappingURL=about2.mjs.map
