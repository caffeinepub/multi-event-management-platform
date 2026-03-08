import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Share2, Users } from "lucide-react";
import { useState } from "react";
import type { Event, Team } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useLeaveTeam } from "../../hooks/useQueries";
import InviteLinkDialog from "./InviteLinkDialog";

export default function TeamCard({
  team,
  event,
}: { team: Team; event: Event }) {
  const { identity } = useInternetIdentity();
  const leaveMutation = useLeaveTeam();
  const isCreator =
    identity && team.creator.toString() === identity.getPrincipal().toString();

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave this team?")) {
      leaveMutation.mutate(team.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            {isCreator && (
              <Badge variant="secondary" className="mt-1">
                Team Leader
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <InviteLinkDialog team={team} event={event} />
            {!isCreator && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
}
