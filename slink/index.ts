import * as slint from "slint-ui";
let ui = slint.loadFile(new URL("main.slint", import.meta.url));
let demo = new ui.Demo();

await demo.run();
