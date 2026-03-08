import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Event, Team, UserProfile, UserRole } from "../backend";
import { useActor } from "./useActor";

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Profile saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// Event Queries
export function useGetAllEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useGetMyEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ["myEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEvents();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetEvent(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event | null>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!actor || !eventId) return null;
      return actor.getEvent(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      dateTime: string;
      venue: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createEvent(
        data.title,
        data.description,
        data.dateTime,
        data.venue,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Event created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      eventId: string;
      title: string;
      description: string;
      dateTime: string;
      venue: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateEvent(
        data.eventId,
        data.title,
        data.description,
        data.dateTime,
        data.venue,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Event updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });
}

// Registration Queries
export function useRegisterForEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerForEvent(eventId);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Successfully registered for event");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register for event");
    },
  });
}

export function useUnregisterFromEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unregisterFromEvent(eventId);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Successfully unregistered from event");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unregister from event");
    },
  });
}

export function useGetEventRegistrations(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["eventRegistrations", eventId],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      return actor.getEventRegistrations(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
  });
}

// Team Queries
export function useGetEventTeams(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Team[]>({
    queryKey: ["eventTeams", eventId],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      return actor.getEventTeams(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
  });
}

export function useGetTeam(teamId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Team | null>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!actor || !teamId) return null;
      return actor.getTeam(teamId);
    },
    enabled: !!actor && !actorFetching && !!teamId,
  });
}

export function useCreateTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { eventId: string; teamName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTeam(data.eventId, data.teamName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["eventTeams", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      toast.success("Team created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create team");
    },
  });
}

export function useJoinTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.joinTeam(teamId);
    },
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["eventTeams"] });
      toast.success("Successfully joined team");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join team");
    },
  });
}

export function useLeaveTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.leaveTeam(teamId);
    },
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["eventTeams"] });
      toast.success("Successfully left team");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to leave team");
    },
  });
}

// Winner Declaration
export function useDeclareWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { eventId: string; teamId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.declareWinner(data.eventId, data.teamId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      toast.success("Winner declared successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to declare winner");
    },
  });
}

// Check-in
export function useCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.checkIn(eventId);
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({
        queryKey: ["checkedInParticipants", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["eventStatistics", eventId] });
      toast.success("Checked in successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check in");
    },
  });
}

export function useGetCheckedInParticipants(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["checkedInParticipants", eventId],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      return actor.getCheckedInParticipants(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
  });
}

// Statistics
export function useGetEventStatistics(eventId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    registrationCount: bigint;
    teamCount: bigint;
    checkInCount: bigint;
  }>({
    queryKey: ["eventStatistics", eventId],
    queryFn: async () => {
      if (!actor || !eventId)
        return {
          registrationCount: BigInt(0),
          teamCount: BigInt(0),
          checkInCount: BigInt(0),
        };
      return actor.getEventStatistics(eventId);
    },
    enabled: !!actor && !actorFetching && !!eventId,
    refetchInterval: 10000,
  });
}
