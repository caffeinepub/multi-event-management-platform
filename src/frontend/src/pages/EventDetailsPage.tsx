import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Trophy, Users } from "lucide-react";
import { UserRole } from "../backend";
import AttendeeListDialog from "../components/organizer/AttendeeListDialog";
import EditEventDialog from "../components/organizer/EditEventDialog";
import ExportReportButton from "../components/organizer/ExportReportButton";
import WinnerDeclarationDialog from "../components/organizer/WinnerDeclarationDialog";
import CreateTeamDialog from "../components/participant/CreateTeamDialog";
import TeamCard from "../components/participant/TeamCard";
import WinnerBanner from "../components/participant/WinnerBanner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCheckIn,
  useGetCallerUserProfile,
  useGetEvent,
  useGetEventStatistics,
  useGetEventTeams,
  useRegisterForEvent,
  useUnregisterFromEvent,
} from "../hooks/useQueries";

export default function EventDetailsPage() {
  const { eventId } = useParams({ from: "/event/$eventId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: event, isLoading } = useGetEvent(eventId);
  const { data: teams = [] } = useGetEventTeams(eventId);
  const { data: statistics } = useGetEventStatistics(eventId);
  const { data: userProfile } = useGetCallerUserProfile();
  const registerMutation = useRegisterForEvent();
  const unregisterMutation = useUnregisterFromEvent();
  const checkInMutation = useCheckIn();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12">
        <div className="text-center">Event not found</div>
      </div>
    );
  }

  const isOrganizer =
    userProfile?.role === UserRole.organizer &&
    event.organizer.toString() === identity?.getPrincipal().toString();
  const isParticipant = userProfile?.role === UserRole.participant;
  const isRegistered =
    identity &&
    event.registeredParticipants.some(
      (p) => p.toString() === identity.getPrincipal().toString(),
    );
  const userTeams = teams.filter(
    (t) =>
      identity &&
      t.members.some(
        (m) => m.toString() === identity.getPrincipal().toString(),
      ),
  );

  const handleRegister = () => {
    registerMutation.mutate(eventId);
  };

  const handleUnregister = () => {
    unregisterMutation.mutate(eventId);
  };

  const handleCheckIn = () => {
    checkInMutation.mutate(eventId);
  };

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: -1 as any })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {event.winningTeam && <WinnerBanner event={event} teams={teams} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.dateTime).toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </Badge>
                  </div>
                </div>
                {isOrganizer && <EditEventDialog event={event} />}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {isParticipant && isRegistered && (
            <Card>
              <CardHeader>
                <CardTitle>My Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {userTeams.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven't joined any team yet
                    </p>
                    <CreateTeamDialog eventId={eventId} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userTeams.map((team) => (
                      <TeamCard key={team.id} team={team} event={event} />
                    ))}
                    <CreateTeamDialog eventId={eventId} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isOrganizer && (
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <AttendeeListDialog eventId={eventId} />
                  <ExportReportButton eventId={eventId} />
                  {!event.winningTeam && teams.length > 0 && (
                    <WinnerDeclarationDialog eventId={eventId} teams={teams} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Registrations
                </span>
                <span className="font-semibold">
                  {statistics ? Number(statistics.registrationCount) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Teams Formed
                </span>
                <span className="font-semibold">
                  {statistics ? Number(statistics.teamCount) : 0}
                </span>
              </div>
              {isOrganizer && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Check-ins
                  </span>
                  <span className="font-semibold">
                    {statistics ? Number(statistics.checkInCount) : 0}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {isParticipant && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isRegistered ? (
                  <Button
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                    className="w-full"
                  >
                    {registerMutation.isPending
                      ? "Registering..."
                      : "Register for Event"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInMutation.isPending}
                      className="w-full"
                      variant="default"
                    >
                      {checkInMutation.isPending
                        ? "Checking in..."
                        : "Check In"}
                    </Button>
                    <Button
                      onClick={handleUnregister}
                      disabled={unregisterMutation.isPending}
                      className="w-full"
                      variant="outline"
                    >
                      {unregisterMutation.isPending
                        ? "Unregistering..."
                        : "Unregister"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.id} className="p-3 border rounded-lg">
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.members.length} member
                        {team.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
