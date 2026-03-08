import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import { useState } from "react";
import {
  useGetCheckedInParticipants,
  useGetEventRegistrations,
  useGetUserProfile,
} from "../../hooks/useQueries";

export default function AttendeeListDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const { data: registrations = [] } = useGetEventRegistrations(eventId);
  const { data: checkedIn = [] } = useGetCheckedInParticipants(eventId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          View Attendees
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Event Attendees ({registrations.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {registrations.map((principal) => {
              const isCheckedIn = checkedIn.some(
                (p) => p.toString() === principal.toString(),
              );
              return (
                <AttendeeRow
                  key={principal.toString()}
                  principal={principal}
                  isCheckedIn={isCheckedIn}
                />
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AttendeeRow({
  principal,
  isCheckedIn,
}: { principal: any; isCheckedIn: boolean }) {
  const { data: profile } = useGetUserProfile(principal);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <div className="font-medium">{profile?.name || "Loading..."}</div>
        <div className="text-xs text-muted-foreground">{profile?.email}</div>
      </div>
      {isCheckedIn ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Checked In
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="w-3 h-3" />
          Not Checked In
        </Badge>
      )}
    </div>
  );
}
