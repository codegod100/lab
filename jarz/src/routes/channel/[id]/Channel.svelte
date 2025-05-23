<script lang="ts">
    import { ChannelSchema, MessageSchema } from "$lib/schema";
    import { CoList } from "jazz-tools";
    import { onMount } from "svelte";
    import "jazz-inspector-element";
    import { AccountCoState } from "jazz-svelte";
    import { AccountSchema } from "$lib/schema";

    const account = new AccountCoState(AccountSchema, {
        resolve: {
            profile: true,
        },
    });
    console.log("acccount", account)

    account.current?.subscribe((value) => {
        console.log("subscribed account", value);
    });

    let { id } = $props();
    let messages = $state<CoList>();
    let channel = $state<CoList>();

    onMount(async () => {
        channel = await ChannelSchema.load(id);

        channel!.subscribe((value) => {
            console.log("subscribed channel", value.id);
            messages = value;
        });
    });

    function deleteMessage(message: typeof MessageSchema) {
        if (!messages) return;
        const index = messages.indexOf(message);
        if (index > -1) {
            channel.splice(index, 1);
        }
    }

    document.body.appendChild(document.createElement("jazz-inspector"));
</script>

<div>Channel id is {id}</div>

<button
    onclick={() => {
        channel?.push(MessageSchema.create({ text: "sup" }));
    }}>Add Message</button
>

{#if messages}
    {#each messages as message}
        {#if message}
            <div class="message-container">
                <span>{message.text} {message.id}</span>
                <button
                    class="delete-btn"
                    onclick={() => deleteMessage(message)}>×</button
                >
            </div>
        {/if}
    {/each}
{/if}

<style>
    .message-container {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 5px 0;
        padding: 5px;
    }

    .delete-btn {
        cursor: pointer;
        background: none;
        border: none;
        color: #999;
        font-size: 1.2em;
        line-height: 1;
        padding: 0 5px;
    }

    .delete-btn:hover {
        color: #ff4444;
    }
</style>
