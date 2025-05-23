<script lang="ts">
    import { getSpaces } from "./storage.svelte";

    const space_ids = getSpaces();
</script>

{#each space_ids as id}
    <a href={`/space/${id}`}>Goto {id}</a>
{/each}
