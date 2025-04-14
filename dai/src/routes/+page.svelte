<script lang="ts">
    import "../style.css";
    // Minimal type for the calendar instance
    type CalendarInstance = {
        focusedDate: string;
        today: string;
    }
    import type { PageProps } from "./$types";
    const { data }: PageProps = $props();
    import Code from "../components/Code.svelte";
    const today = new Date().toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
    // Svelte requires 'let' for bind:this and reactive state, ignore linter false positives
    // biome-ignore lint/style/useConst: svelte state
    let cal = $state<CalendarInstance>({focusedDate: "", today});
    // biome-ignore lint/style/useConst: svelte state
    let day = $state(today);
</script>

<div class="text-4xl mb-5">Testing Sveltekit with DaisyUI</div>
<div class="text-2xl mb-3">Button example</div>
<button class="btn btn-primary mb-5">Button</button>
<div class="mb-5">
    <div class="text-2xl">Code example javascript</div>
    <Code code={data.code} />
</div>
<div class="mb-5">
    <div class="text-2xl">Code example rust</div>
    <Code code={data.code2} />
</div>
<div class="text-2xl">Calendar example</div>
<calendar-date
    class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
    bind:this={cal}
    onfocusday={() => { day = cal.focusedDate; }}
>
    <span slot="previous">
        <svg
            aria-label="Previous"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
    </span>
    <span slot="next">
        <svg
            aria-label="Next"
            class="fill-current size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
    </span>
    <calendar-month></calendar-month>
</calendar-date>

<div>Day: {day}</div>
