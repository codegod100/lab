import createPlugin from "@extism/extism"
const plugin = await createPlugin(
    './zig-out/bin/zig-pdk-template.wasm',
    { useWasi: true }
);

let out = await plugin.call("greet", "person");
console.log(out?.text())