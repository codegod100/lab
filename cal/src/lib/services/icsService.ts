import ICAL from 'ical.js';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarSource } from '$lib/types/calendar';

/**
 * Fetches ICS data from a URL
 */
export async function fetchIcsData(url: string): Promise<string> {
  try {
    // Use a CORS proxy to bypass CORS restrictions
    const corsProxyUrl = 'https://corsproxy.io/?';
    const proxyUrl = `${corsProxyUrl}${encodeURIComponent(url)}`;

    console.log(`Fetching ICS data from: ${proxyUrl}`);
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ICS data: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching ICS data:', error);
    throw error;
  }
}

/**
 * Parses ICS data into CalendarEvents
 */
export function parseIcsData(icsData: string, sourceId: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    return vevents.map((vevent, index) => {
      const event = new ICAL.Event(vevent);
      const id = event.uid || `${sourceId}-${index}`;
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      const allDay = event.startDate.isDate; // isDate is true for all-day events

      // Extract categories if they exist
      const categories = vevent.getAllProperties('categories')
        .flatMap(prop => prop.getValues())
        .filter(Boolean);

      // Get URL property if it exists
      let eventUrl: string | undefined = undefined;
      try {
        const urlProp = vevent.getFirstPropertyValue('url');
        if (typeof urlProp === 'string') {
          eventUrl = urlProp;
        }
      } catch (e) {
        // URL property doesn't exist or is invalid
      }

      return {
        id,
        title: event.summary || 'Untitled Event',
        description: event.description,
        start,
        end,
        location: event.location,
        url: eventUrl,
        allDay,
        recurrence: event.recurrenceId ? format(event.recurrenceId.toJSDate(), 'yyyy-MM-dd') : undefined,
        categories,
        // Default color can be overridden by the source color
        color: undefined
      };
    });
  } catch (error) {
    console.error('Error parsing ICS data:', error);
    throw new Error(`Failed to parse ICS data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches and parses ICS data into a CalendarSource
 */
export async function fetchCalendarSource(url: string, name: string, id: string, color?: string): Promise<CalendarSource> {
  const icsData = await fetchIcsData(url);
  const events = parseIcsData(icsData, id);

  return {
    id,
    name,
    url,
    color,
    events,
    lastUpdated: new Date()
  };
}
