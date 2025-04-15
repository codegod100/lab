const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.g2Nxx-8g.js",app:"_app/immutable/entry/app.BHrRmhT6.js",imports:["_app/immutable/entry/start.g2Nxx-8g.js","_app/immutable/chunks/BMx6HN0F.js","_app/immutable/chunks/B8m12vVI.js","_app/immutable/chunks/CIM6tsjs.js","_app/immutable/entry/app.BHrRmhT6.js","_app/immutable/chunks/B8m12vVI.js","_app/immutable/chunks/DnFPaZXn.js","_app/immutable/chunks/CqaETfVv.js","_app/immutable/chunks/DPFqiyCo.js","_app/immutable/chunks/Dze-Thk_.js","_app/immutable/chunks/CIM6tsjs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BGV4fih8.js')),
			__memo(() => import('./chunks/1-BAii20lP.js')),
			__memo(() => import('./chunks/2-BNdsBFMd.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/db",
				pattern: /^\/api\/db\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BeZrG2G0.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
