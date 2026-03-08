# Multi-Event Management Platform

## Current State

- Full-stack platform with Motoko backend and React/TypeScript frontend
- Organizer and participant roles with separate dashboards
- Organizers can create/manage events, declare winners, view check-ins and stats
- Participants can register for events, create/join teams via invite links
- Profile setup modal on first login to select role
- No AI assistance exists anywhere in the app

## Requested Changes (Diff)

### Add

- **AI Event Planner feature** using Google Gemini API (called from the frontend)
- An interactive AI chat/suggestion panel in the Organizer Dashboard
- When an organizer logs in or navigates to "Create Event", a prompt asks: "What's your idea to organize your dream event?" (text input)
- On submission the AI (Gemini) returns a full structured event plan including:
  - Recommended event type and format
  - Suggested event title and description
  - Venue recommendations based on the organizer's stated location/city
  - Date/time suggestions
  - Required items checklist (equipment, decorations, catering, etc.) tailored to event type
  - Suggested agenda/schedule
  - Estimated participant capacity
  - Budget breakdown hints
- AI suggestions are displayed in a visually rich response card with sections
- Organizer can click "Use This Plan" to auto-fill the Create Event form with the AI-suggested title, description, venue, and date
- A dedicated "AI Planner" tab added to the OrganizerDashboard Tabs
- Gemini API key is stored as a frontend environment config (VITE_GEMINI_API_KEY)

### Modify

- `OrganizerDashboard.tsx`: Add "AI Planner" tab alongside existing "My Events" and "Create Event" tabs
- `CreateEventForm.tsx`: Accept optional pre-filled values from AI suggestions

### Remove

- Nothing removed
