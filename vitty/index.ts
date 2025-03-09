import { LoroDoc } from "loro-crdt";
const doc = new LoroDoc();
doc.getText("text").insert(0, "Hello world!");
const bytes = doc.export({ mode: "snapshot" });
console.log(bytes);
