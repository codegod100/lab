<script lang="ts">
    import { drawDot } from "$lib";
    import {
        DbConnection,
        type EventContext,
        Message,
        User,
        SetName,
    } from "../module_bindings";
    import { onMount } from "svelte";
    // import { connectCallback } from "$lib";
    import { Identity } from "@clockworklabs/spacetimedb-sdk";
    let this_user: User;
    const users = new Map<string, User>();
    let canvas: HTMLCanvasElement;
    let token: string;
    onMount(() => {
        token = localStorage.getItem("token") as string;
    });
    let conn = DbConnection.builder()
        .withUri("wss://maincloud.spacetimedb.com")
        .withModuleName("game")
        .withToken(token || "")
        .onConnect(connectCallback)
        .build();

    function connectCallback(
        conn: DbConnection,
        identity: Identity,
        token: string,
    ) {
        localStorage.setItem("token", token);
        console.log(
            `Connected to the database! ${identity.toHexString()}, token: ${token}`,
        );
        conn.subscriptionBuilder()
            .onApplied((ctx) => {
                this_user = ctx.db.user.identity.find(identity) as User;
                for (const current of ctx.db.user.iter()) {
                    users.set(current.identity.toHexString(), current);
                }
                // Load and display existing messages
                for (const message of ctx.db.message.iter()) {
                    // displayMessage(message);
                }
                drawDot(canvas, users);

                if (!this_user.name) {
                    let name = prompt("What name do you want?") as string;
                    conn.reducers.setName(name);
                }
            })
            .subscribe(["select * from user", "select * from message"]);
    }
</script>

<canvas bind:this={canvas} width="600" height="400">
    Your browser does not support the HTML5 canvas element.
</canvas>

<style>
    canvas {
        border: 1px solid #000;
        display: block;
        margin: 0 auto;
    }
</style>
