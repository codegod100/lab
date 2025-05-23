<script lang="ts">
    import { page } from "$app/state";
    import Channel from "./Channel.svelte";
    let id = page.params.id
</script>
<Channel {id} />
