import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Event } from "../../backend";

export default function EventGrid({ events }: { events: Event[] }) {
  const navigate = useNavigate();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <img
          src="/assets/generated/empty-events.dim_400x300.png"
          alt="No events"
          className="w-64 h-48 mx-auto mb-4 opacity-50"
        />
        <p className="text-muted-foreground">No events available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const isPast = new Date(event.dateTime) < new Date();
        return (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.winningTeam && (
                  <Badge variant="default">Completed</Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.dateTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {event.registeredParticipants.length} registered
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {event.description}
              </p>
              <Button
                onClick={() => navigate({ to: `/event/${event.id}` })}
                className="w-full"
                variant={isPast ? "outline" : "default"}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
