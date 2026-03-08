import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Calendar, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetEvent, useGetTeam, useJoinTeam } from "../hooks/useQueries";

export default function JoinTeamPage() {
  const { teamId } = useParams({ from: "/join-team/$teamId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: team, isLoading: teamLoading } = useGetTeam(teamId);
  const { data: event } = useGetEvent(team?.eventId);
  const joinMutation = useJoinTeam();

  if (teamLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading team details...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container py-12">
        <div className="text-center">Team not found</div>
      </div>
    );
  }

  const isAlreadyMember =
    identity &&
    team.members.some(
      (m) => m.toString() === identity.getPrincipal().toString(),
    );

  const handleJoin = async () => {
    await joinMutation.mutateAsync(teamId);
    navigate({ to: `/event/${team.eventId}` });
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Team Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
              <p className="text-muted-foreground">
                You've been invited to join this team
              </p>
            </div>

            {event && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Event</span>
                </div>
                <p>{event.title}</p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">Team Members</span>
              </div>
              <p>
                {team.members.length} member
                {team.members.length !== 1 ? "s" : ""}
              </p>
            </div>

            {!identity ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Please login to join this team
                </p>
                <Button onClick={() => navigate({ to: "/" })}>
                  Go to Login
                </Button>
              </div>
            ) : isAlreadyMember ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  You are already a member of this team
                </p>
                <Button
                  onClick={() => navigate({ to: `/event/${team.eventId}` })}
                >
                  View Event
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="w-full"
                size="lg"
              >
                {joinMutation.isPending ? "Joining..." : "Join Team"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
