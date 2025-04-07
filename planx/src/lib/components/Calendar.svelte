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
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        },
        // Apply DaisyUI-compatible styling
        buttonText: {
          today: 'Today',
          month: 'Month',
          week: 'Week'
        }
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

<!-- Container element for FullCalendar with DaisyUI card styling -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body p-2">
    <div bind:this={calendarEl} class="min-h-[450px]">
      <!-- FullCalendar will render inside this div -->
    </div>
  </div>
</div>