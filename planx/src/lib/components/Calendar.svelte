<script lang="ts">
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core'; // Import the core Calendar class
  import dayGridPlugin from '@fullcalendar/daygrid'; // Import the plugin

  // Reference to the container div element
  let calendarEl: HTMLDivElement;

  onMount(() => {
    // Ensure the element is available before initializing
    if (calendarEl) {
      const calendar = new Calendar(calendarEl, {
        plugins: [ dayGridPlugin ],
        initialView: 'dayGridMonth',
        // Add any other FullCalendar options here
        // events: [ ... ]
      });

      calendar.render(); // Render the calendar

      // Optional: Return a cleanup function if needed (e.g., to destroy the calendar instance)
      // return () => {
      //   calendar.destroy();
      // };
    }
  });
</script>

<!-- Container element for FullCalendar -->
<!-- Add Tailwind classes or other styles as needed -->
<div bind:this={calendarEl} class="min-h-[450px] border border-gray-300 rounded-md bg-white shadow-inner p-2.5">
  <!-- FullCalendar will render inside this div -->
</div>