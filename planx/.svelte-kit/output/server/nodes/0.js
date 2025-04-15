

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.2bn6YSHr.js","_app/immutable/chunks/CqaETfVv.js","_app/immutable/chunks/B8m12vVI.js","_app/immutable/chunks/DPFqiyCo.js"];
export const stylesheets = ["_app/immutable/assets/0.CLcM-X12.css"];
export const fonts = [];
