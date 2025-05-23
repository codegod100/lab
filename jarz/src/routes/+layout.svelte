<script lang="ts">
        const peerUrl = "wss://cloud.jazz.tools/?key=nandithebull@outlook.com";
    // const peerUrl = "ws://127.0.0.1:4200"
    let sync = { peer: peerUrl };
    import {AccountSchema} from "$lib/schema";
    import {JazzProvider} from "jazz-svelte";
    let { children } = $props();
</script>
<JazzProvider {sync} {AccountSchema}>
    
    {@render children()}</JazzProvider>