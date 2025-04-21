<script lang="ts">
  import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, isSameMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
  import type { CalendarEvent } from '$lib/types/calendar';
  import EventDetails from './EventDetails.svelte';

  // Props
  export let events: CalendarEvent[] = [];
  $: console.dir(events, { depth: null }); // Log all events
  let currentDate = new Date();

  // State
  let selectedEvent: CalendarEvent | null = null;

  // Reactive declarations
  $: monthStart = startOfMonth(currentDate);
  $: monthEnd = endOfMonth(currentDate);
  $: calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  $: calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  $: days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  $: weeks = Array.from(
    { length: Math.ceil(days.length / 7) },
    (_, i) => days.slice(i * 7, (i + 1) * 7)
  );

  // Methods
  function previousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function goToToday() {
    currentDate = new Date();
  }

  function getEventsForDay(day: Date): CalendarEvent[] {
    const dayEvents = events.filter(event => {
      const eventEnd = new Date(event.end);
      const eventStart = new Date(event.start)
      const isMidnight = eventEnd.getHours() === 0 && eventEnd.getMinutes() === 0;
      const isEndDay = format(day, 'yyyy-MM-dd') === format(eventEnd, 'yyyy-MM-dd');

      // Don't show event on a day if it ends exactly at midnight of that day
      if (isMidnight && isEndDay) {
        return false;
      }
      const withinInterval = isWithinInterval(day, { 
        start: startOfDay(eventStart), 
        end: isMidnight ? endOfDay(new Date(eventEnd.getTime() - 1)) : endOfDay(eventEnd) 
      });
      console.dir([day, eventStart, eventEnd, withinInterval]);
      // Check if the day is within the event's time range
      return withinInterval ||
        // Or if it's an all-day event on this day
        (event.allDay &&
         format(day, 'yyyy-MM-dd') === format(new Date(event.start), 'yyyy-MM-dd'));
    });

    console.dir({ day: format(day, 'yyyy-MM-dd'), events: dayEvents }, { depth: null });
    return dayEvents;
  }

  function selectEvent(event: CalendarEvent) {
    selectedEvent = event;
  }

  function closeEventDetails() {
    selectedEvent = null;
  }
</script>

<div class="calendar">
  <div class="calendar-header">
    <h2>{format(currentDate, 'MMMM yyyy')}</h2>
    <div class="calendar-controls">
      <button on:click={previousMonth}>Previous</button>
      <button on:click={goToToday}>Today</button>
      <button on:click={nextMonth}>Next</button>
    </div>
  </div>

  <div class="calendar-grid">
    <div class="weekday-header">
      <div class="weekday">Mon</div>
      <div class="weekday">Tue</div>
      <div class="weekday">Wed</div>
      <div class="weekday">Thu</div>
      <div class="weekday">Fri</div>
      <div class="weekday">Sat</div>
      <div class="weekday">Sun</div>
    </div>

    <div class="calendar-days">
      {#each weeks as week}
        <div class="week">
          {#each week as day}
            <div class="day {isToday(day) ? 'today' : ''} {!isSameMonth(day, currentDate) ? 'other-month' : ''}">
              <div class="day-number">{format(day, 'd')}</div>
              <div class="day-events">
                {#each getEventsForDay(day) as event}
                  <button
                    class="event"
                    style="background-color: {event.color || '#4285f4'};"
                    on:click={() => selectEvent(event)}
                  >
                    {event.title}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if selectedEvent}
    <EventDetails event={selectedEvent} onClose={closeEventDetails} />
  {/if}
</div>

<style>
  .calendar {
    font-family: Arial, sans-serif;
    max-width: 1000px;
    margin: 0 auto;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .calendar-controls {
    display: flex;
    gap: 0.5rem;
  }

  .calendar-grid {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }

  .weekday {
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
  }

  .calendar-days {
    display: flex;
    flex-direction: column;
  }

  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid #e0e0e0;
  }

  .week:last-child {
    border-bottom: none;
  }

  .day {
    min-height: 100px;
    padding: 0.5rem;
    border-right: 1px solid #e0e0e0;
    position: relative;
  }

  .day:last-child {
    border-right: none;
  }

  .day-number {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .today {
    background-color: #e8f4fe;
  }

  .other-month {
    color: #aaa;
    background-color: #f9f9f9;
  }

  .day-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .event {
    padding: 0.25rem;
    border-radius: 2px;
    font-size: 0.8rem;
    color: white;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
