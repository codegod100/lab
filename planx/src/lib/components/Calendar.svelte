<script lang="ts">
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';

  const { events = [] } = $props<{ events?: Array<{ id: string; title: string; start: string }> }>();

  let calendarEl: HTMLDivElement;
  let calendarInstance = $state<Calendar | null>(null);

  onMount(() => {
    if (calendarEl) {
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        events, // initialize with events
      });

      calendar.render();
      calendarInstance = calendar;

      return () => {
        calendar.destroy();
        calendarInstance = null;
      };
    }
  });

  $effect(() => {
    if (calendarInstance) {
      calendarInstance.setOption('events', events);
    }
  });
</script>

<!-- Container element for FullCalendar -->
<!-- Add Tailwind classes or other styles as needed -->
<div bind:this={calendarEl} class="min-h-[450px] border border-gray-300 rounded-md bg-white shadow-inner p-2.5">
  <!-- FullCalendar will render inside this div -->
</div>