import { memorySync1Adapters, Syncer1 } from "@muni-town/leaf/sync1";
import { denoKvStorageAdapter } from "@muni-town/leaf/storage/deno-kv";
import { StorageManager } from "@muni-town/leaf/storage";
import { defComponent, Entity, LoroText, Peer } from "@muni-town/leaf";
const [syncAdapter1, syncAdapter2] = memorySync1Adapters();
const Text = defComponent("text:01JNVY76XPH6Q5AVA385HP04G7", LoroText, (t) =>
  t.update(""),
);
const peerId = "leaf:awg8ns27f5e164htq69r7tyb63vxsaj4ejpgqwa7e8gm00ppt5yg";
const peer1 = new Peer(
  new StorageManager(
    denoKvStorageAdapter(await Deno.openKv("data/peer1.sqlite")),
  ),
  new Syncer1(syncAdapter1),
);
const peer2 = new Peer(
  new StorageManager(
    denoKvStorageAdapter(await Deno.openKv("data/peer2.sqlite")),
  ),
  new Syncer1(syncAdapter2),
);
const ent1 = await peer1.open(peerId);
const ent2 = await peer2.open(peerId);

export async function POST({ request }: { request: Request }) {
  const data = await request.text();
  ent1.getOrInit(Text).update(data);
  ent1.commit();
  console.log(data);
  console.log("ent 2");
  console.log(ent2.doc.toJSON());
  return Response.json("ok");
}
