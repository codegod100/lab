<script lang="ts">
    import { ChannelSchema, MessageSchema } from "$lib/schema";
    import { CoList, Account, co } from "jazz-tools";
    import { onMount } from "svelte";
    import "jazz-inspector-element";
    import { AccountCoState } from "jazz-svelte";
    import { AccountSchema } from "$lib/schema";

    const account = new AccountCoState(AccountSchema, {
        resolve: {
            profile: true,
        },
    });
    console.log("acccount", account);
    // account.updateValue({profile:{did: "123"}})
    account.current?.subscribe((value) => {
        console.log("subscribed account", value);
    });

    $effect(() => {
        console.log("account", account.current?.profile);
        if (account.current?.profile && !account.current?.profile?.did) {
            account.current.profile.did = "did:plc:ngokl2gnmpbvuvrfckja3g7p";
            console.log("did set");
        }
    });

    let { id } = $props();
    let messages = $state<CoList>();
    let channel = $state<CoList>();
    let newDid = $state("");

    async function AccountIdToAccount(id: string) {
        return await AccountSchema.load(id);
    }

    async function verifyAuthor(did: string, id: string){
        const resp = await fetch(`https://amanita.us-east.host.bsky.network/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=nandi.schema.jazz&rkey=index`)
        const data = await resp.json()
        console.log(data);
        if(data.value.accounts.includes(id)) return true;
        return false
    }

    onMount(async () => {
        channel = await ChannelSchema.load(id);

        channel!.subscribe(async (value: co.loaded<typeof ChannelSchema>) => {
            console.log("subscribed channel", value.id);
            for (const message of value) {
                if (!message) continue;
                console.log("message data", message._edits.text.by.id);
            }
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

<div class="did-container">
    <input
        type="text"
        bind:value={newDid}
        placeholder="Enter DID"
        class="did-input"
    />
    <button
        onclick={() => {
            if (newDid && account.current?.profile) {
                account.current.profile.did = newDid;
                newDid = "";
            }
        }}
        class="did-button"
    >
        Set DID
    </button>
    {#if account.current?.profile?.did}
        <div class="current-did">
            Current DID: {account.current.profile.did}
        </div>
    {/if}
</div>

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
                <span
                    >{message.text}
                    {message.id}
                    {#await AccountIdToAccount(message._edits.text.by.id) then account}
                        {#await verifyAuthor(account?.profile?.did, message._edits.text.by.id) then valid}
                            {valid ? "Account validates on PDS" : "Account invalid"}
                        {/await}
                    {/await}</span
                >
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

    .did-container {
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }

    .did-input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        flex-grow: 1;
        max-width: 400px;
    }

    .did-button {
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .did-button:hover {
        background-color: #45a049;
    }

    .current-did {
        width: 100%;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #ddd;
        font-size: 0.9em;
        color: #666;
    }
</style>
