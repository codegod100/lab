<script lang="ts">
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core'; // Import the core Calendar class
  import dayGridPlugin from '@fullcalendar/daygrid'; // Import the plugin
  // Potentially import interactionPlugin, timeGridPlugin etc. if needed

  // Use let for bind:this, or $state if you prefer managing the element ref that way
  let calendarEl: HTMLDivElement;
  let calendarInstance = $state<Calendar | null>(null); // Optional: store the instance if needed

  onMount(() => {
    // Ensure the element is available before initializing
    if (calendarEl) {
      const calendar = new Calendar(calendarEl, {
        plugins: [ dayGridPlugin /*, interactionPlugin, timeGridPlugin */ ],
        initialView: 'dayGridMonth',
        // headerToolbar: { ... } // Configure header
        // events: [] // Pass events data, maybe via props or a store
        // dateClick: (info) => { ... } // Handle date clicks
        // eventClick: (info) => { ... } // Handle event clicks
      });

      calendar.render(); // Render the calendar
      calendarInstance = calendar; // Store instance if needed

      // Cleanup function returned by onMount
      return () => {
        calendar.destroy();
        calendarInstance = null;
      };
    }
  });

  // Example using $effect.if for reactivity (e.g., updating events)
  // export let events = $state([]); // If events were passed as a reactive prop
  // $effect.if(calendarInstance) (() => {
  //   calendarInstance.setOption('events', events);
  // });
</script>

<!-- Container element for FullCalendar -->
<!-- Add Tailwind classes or other styles as needed -->
<div bind:this={calendarEl} class="min-h-[450px] border border-gray-300 rounded-md bg-white shadow-inner p-2.5">
  <!-- FullCalendar will render inside this div -->
</div>