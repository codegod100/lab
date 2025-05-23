<script lang="ts">
    import { page } from "$app/state";
    import Space from "./Space.svelte";
    let id = page.params.id
</script>

<Space {id} />