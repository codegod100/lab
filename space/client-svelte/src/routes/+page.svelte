<script lang="ts">
    //@ts-ignore
    /* @vite-ignore */
    import { type User, DbConnection } from "bindings";
    import { onMount } from "svelte";
    import { Identity } from "@clockworklabs/spacetimedb-sdk";

    const speed = 5;
    const dotRadius = 10;
    const users = new Map<string, User>();
    let canvas: HTMLCanvasElement;
    let token = "";
    let this_user: User;

    onMount(async () => {
        let conn = DbConnection.builder()
            .withUri("wss://maincloud.spacetimedb.com")
            .withModuleName("game")
            .withToken(token)
            .onConnect(connectCallback)
            .build();
        token = localStorage.getItem("token") as string;

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

        function drawDot(canvas: HTMLCanvasElement, users: Map<string, User>) {
            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const [key, user] of users) {
                let x = user.position.x || canvas.width / 2;
                let y = user.position.y || canvas.height / 2;
                let ballColor = user.ballColor;

                // Initial draw
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = ballColor;
                ctx.fill();
                ctx.closePath();
            }
        }

        globalThis.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowUp":
                    console.log("up");
                    this_user.position.y = Math.max(
                        dotRadius,
                        this_user.position.y - speed,
                    );
                    break;
                case "ArrowDown":
                    this_user.position.y = Math.min(
                        canvas.height - dotRadius,
                        this_user.position.y + speed,
                    );
                    break;
                case "ArrowLeft":
                    this_user.position.x = Math.max(
                        dotRadius,
                        this_user.position.x - speed,
                    );
                    break;
                case "ArrowRight":
                    this_user.position.x = Math.min(
                        canvas.width - dotRadius,
                        this_user.position.x + speed,
                    );
                    break;
            }
            console.log({ this_user });
            conn.reducers.setPosition(
                this_user.position.x,
                this_user.position.y,
            );
            // e.preventDefault();
        });
    });
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
