<script lang="ts">
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import Code from "@tiptap/extension-code";
    import { onMount } from "svelte";
    import { defComponent, Entity, LoroText } from "@muni-town/leaf";

    let editorRef: HTMLDivElement;
    let content: string = $state("");
    let editor: Editor;
    let lastSaved: string = $state("");

    async function saveContent(ev) {
        ev.preventDefault();
        try {
            const resp = await fetch("/peer", {
                method: "POST",
                body: "butthole",
            });
            lastSaved = new Date().toLocaleTimeString();
            console.log("Saved content successfully");
        } catch (error) {
            console.error("Error saving content:", error);
        }
    }

    onMount(() => {
        const initialContent =
            "Start typing here... Use <code>code</code> for inline code.";

        // Initialize main editor
        editor = new Editor({
            element: editorRef,
            content: initialContent,
            extensions: [StarterKit, Code],
            editorProps: {
                attributes: {
                    class: "prose prose-lg focus:outline-none",
                },
            },
            onUpdate: ({ editor }) => {
                content = JSON.stringify(editor.getJSON(), null, 2);
            },
        });

        // Set initial content value
        content = JSON.stringify(editor.getJSON(), null, 2);
    });
</script>

<main class="container mx-auto py-6 px-4 max-w-3xl">
    <h1 class="text-2xl font-bold mb-2 heading-primary">Vibe Editor</h1>
    <p class="text-[#a6adc8] mb-6 text-sm">
        Create and share rich text content
    </p>

    <!-- Editor -->
    <div class="editor-container mb-6">
        <div class="editor-toolbar flex justify-between items-center">
            <span class="text-sm font-medium text-[#cdd6f4]">Editor</span>
            <button class="btn" onclick={saveContent}>Save</button>
        </div>
        <div class="editor-content">
            <div class="tiptap" bind:this={editorRef}></div>
        </div>
    </div>

    <!-- JSON Output -->
    <div class="editor-container mb-6">
        <div class="editor-toolbar">
            <span class="text-sm font-medium text-[#cdd6f4]">Document JSON</span
            >
        </div>
        <div class="editor-content bg-[#11111b]">
            <pre
                class="json-display p-3 overflow-auto rounded"
                style="max-height: 500px;">{content}</pre>
        </div>
    </div>

    <!-- Status -->
    <div class="status-text">
        {#if lastSaved}
            Last saved: {lastSaved}
        {:else}
            Not saved yet
        {/if}
    </div>
</main>
