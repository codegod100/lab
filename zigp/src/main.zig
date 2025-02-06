const std = @import("std");
const extism_pdk = @import("extism-pdk");
const Plugin = extism_pdk.Plugin;

const allocator = std.heap.wasm_allocator;

const Person = struct { name: []const u8, age: i32 };

export fn greet() i32 {
    const plugin = Plugin.init(allocator);
    const json = plugin.getInput() catch unreachable;
    const parsed_person = std.json.parseFromSlice(Person, allocator, json, .{}) catch {
        plugin.setError("while parsing json");
        return 1;
    };
    const name = parsed_person.value.name;
    const person = Person{ .name = parsed_person.value.name, .age = parsed_person.value.age };
    const json_str = std.json.stringifyAlloc(allocator, person, .{}) catch unreachable;
    if (name.len < 1) {
        plugin.setError("need to be called with a greeting");
        return 1;
    }
    // defer allocator.free(name);

    // const output = std.fmt.allocPrint(allocator, "Hello, {s}!", .{name}) catch unreachable;
    plugin.output(json_str);
    return 0;
}
