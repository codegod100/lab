import createPlugin from "@extism/extism"
const plugin = await createPlugin(
    './zig-out/bin/zig-pdk-template.wasm',
    { useWasi: true }
);

let out = await plugin.call("greet", `{"name":"yolo", "age":40}`);
console.log(out?.json())