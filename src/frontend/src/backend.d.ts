import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Event {
    id: string;
    teams: Array<string>;
    organizer: Principal;
    title: string;
    venue: string;
    description: string;
    winningTeam?: string;
    registeredParticipants: Array<Principal>;
    dateTime: string;
}
export interface UserProfile {
    name: string;
    role: UserRole;
    email: string;
}
export interface Team {
    id: string;
    eventId: string;
    creator: Principal;
    members: Array<Principal>;
    name: string;
    inviteLink: string;
}
export enum UserRole {
    organizer = "organizer",
    participant = "participant"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    checkIn(eventId: string): Promise<void>;
    createEvent(title: string, description: string, dateTime: string, venue: string): Promise<string>;
    createTeam(eventId: string, teamName: string): Promise<string>;
    declareWinner(eventId: string, teamId: string): Promise<void>;
    deleteEvent(eventId: string): Promise<void>;
    getAllEvents(): Promise<Array<Event>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCheckedInParticipants(eventId: string): Promise<Array<Principal>>;
    getEvent(eventId: string): Promise<Event | null>;
    getEventRegistrations(eventId: string): Promise<Array<Principal>>;
    getEventStatistics(eventId: string): Promise<{
        teamCount: bigint;
        checkInCount: bigint;
        registrationCount: bigint;
    }>;
    getEventTeams(eventId: string): Promise<Array<Team>>;
    getMyEvents(): Promise<Array<Event>>;
    getTeam(teamId: string): Promise<Team | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinTeam(teamId: string): Promise<void>;
    leaveTeam(teamId: string): Promise<void>;
    registerForEvent(eventId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unregisterFromEvent(eventId: string): Promise<void>;
    updateEvent(eventId: string, title: string, description: string, dateTime: string, venue: string): Promise<void>;
}
