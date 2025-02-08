var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// pkg/wbby_bg.wasm
var exports_wbby_bg = {};
__export(exports_wbby_bg, {
  default: () => wbby_bg_default
});
var wbby_bg_default = "./wbby_bg-xedg6kn2.wasm";

// pkg/wbby_bg.js
var wasm;
function __wbg_set_wasm(val) {
  wasm = val;
}
var lTextDecoder = typeof TextDecoder === "undefined" ? (0, module_wbby_bg.require)("util").TextDecoder : TextDecoder;
var cachedTextDecoder = new lTextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
function greet() {
  wasm.greet();
}
function __wbg_alert_936c52db5a5e62f9(arg0, arg1) {
  alert(getStringFromWasm0(arg0, arg1));
}
function __wbindgen_init_externref_table() {
  const table = wasm.__wbindgen_export_0;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
}
// pkg/wbby.js
__wbg_set_wasm(exports_wbby_bg);
undefined();
export {
  greet,
  __wbindgen_init_externref_table,
  __wbg_set_wasm,
  __wbg_alert_936c52db5a5e62f9
};
