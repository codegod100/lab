<script lang="ts">
    import { SpaceSchema } from "$lib/schema";
    import {onMount} from "svelte";
    let {id} = $props();
    let channels = $state()
    onMount(async () => {
        const space = await SpaceSchema.load(id);

        space!.subscribe((value) => {
            console.log("subscribed space", value);
            channels = value;
        });
    });

</script>
<div>Space id is {id}</div>

{#if channels}
    {#each channels as channel}
        {#if channel}
            <div><a href={`/channel/${channel.id}`}>Goto {channel.id}</a></div>
        {/if}
    {/each}
{/if}