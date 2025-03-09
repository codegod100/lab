<script lang="ts">
    import "../style.css";
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
    import Code from "../components/Code.svelte";
    import { browser, building, dev, version } from "$app/environment";
    const today = new Date().toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
    let cal = $state();
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
    onfocusday={() => (day = cal.focusedDate)}
>
    <svg
        aria-label="Previous"
        class="fill-current size-4"
        slot="previous"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        ><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg
    >
    <svg
        aria-label="Next"
        class="fill-current size-4"
        slot="next"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        ><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg
    >
    <calendar-month></calendar-month>
</calendar-date>

<button onclick={() => console.log(cal.today)}>click me</button>
<div>Day: {day}</div>
