import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { UserRole } from "../backend";
import EventGrid from "../components/participant/EventGrid";
import { useGetAllEvents, useGetCallerUserProfile } from "../hooks/useQueries";

export default function ParticipantDashboard() {
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: events = [], isLoading: eventsLoading } = useGetAllEvents();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!profileLoading && userProfile?.role !== UserRole.participant) {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  if (profileLoading || eventsLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container py-8">
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Browse Events"
          className="w-full h-[200px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-2">Discover Events</h1>
            <p className="text-lg">Find and join exciting college events</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <EventGrid events={filteredEvents} />
    </div>
  );
}
