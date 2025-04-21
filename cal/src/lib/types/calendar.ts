export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  url?: string;
  allDay: boolean;
  recurrence?: string;
  categories?: string[];
  color?: string;
}

export interface CalendarSource {
  id: string;
  name: string;
  url: string;
  color?: string;
  events: CalendarEvent[];
  lastUpdated?: Date;
}

export interface CalendarState {
  sources: CalendarSource[];
  isLoading: boolean;
  error?: string;
}
