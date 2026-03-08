import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Sparkles, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { UserRole } from "../backend";
import AIPlannerPanel from "../components/organizer/AIPlannerPanel";
import CreateEventForm from "../components/organizer/CreateEventForm";
import EventListTable from "../components/organizer/EventListTable";
import { useGetCallerUserProfile, useGetMyEvents } from "../hooks/useQueries";
import type { EventPlan } from "../lib/gemini";

export default function OrganizerDashboard() {
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: events = [], isLoading: eventsLoading } = useGetMyEvents();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ai-planner");
  const [prefillData, setPrefillData] = useState<{
    title?: string;
    description?: string;
    venue?: string;
    dateTime?: string;
  }>({});

  useEffect(() => {
    if (!profileLoading && userProfile?.role !== UserRole.organizer) {
      navigate({ to: "/" });
    }
  }, [userProfile, profileLoading, navigate]);

  const handleUsePlan = (plan: EventPlan) => {
    setPrefillData({
      title: plan.eventTitle,
      description: `${plan.description}\n\nVenue Details: ${plan.venueDetails}\n\nAgenda:\n${plan.agenda.map((item, i) => `${i + 1}. ${item}`).join("\n")}`,
      venue: plan.suggestedVenue,
      dateTime: plan.suggestedDate || "",
    });
    setActiveTab("create");
  };

  if (profileLoading || eventsLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const activeEvents = events.filter((e) => new Date(e.dateTime) >= new Date());
  const totalParticipants = events.reduce(
    (sum, e) => sum + e.registeredParticipants.length,
    0,
  );
  const eventsWithWinners = events.filter((e) => e.winningTeam).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your events and track participation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeEvents.length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Winners Declared
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsWithWinners}</div>
            <p className="text-xs text-muted-foreground">Completed events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger
            value="ai-planner"
            data-ocid="organizer.ai_planner.tab"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Planner
          </TabsTrigger>
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-planner" className="space-y-4">
          <AIPlannerPanel onUsePlan={handleUsePlan} />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EventListTable events={events} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateEventForm
                prefillTitle={prefillData.title}
                prefillDescription={prefillData.description}
                prefillVenue={prefillData.venue}
                prefillDateTime={prefillData.dateTime}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
