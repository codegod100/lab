import { d as defineEventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:url';
import 'node:path';

const index = defineEventHandler((event) => {
  return "Start by editing <code>server/routes/index.ts</code>.";
});

export { index as default };
//# sourceMappingURL=index.mjs.map
