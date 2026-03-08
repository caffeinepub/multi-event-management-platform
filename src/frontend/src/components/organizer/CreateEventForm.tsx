import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateEvent } from "../../hooks/useQueries";

interface CreateEventFormProps {
  prefillTitle?: string;
  prefillDescription?: string;
  prefillVenue?: string;
  prefillDateTime?: string;
}

export default function CreateEventForm({
  prefillTitle,
  prefillDescription,
  prefillVenue,
  prefillDateTime,
}: CreateEventFormProps) {
  const [title, setTitle] = useState(prefillTitle ?? "");
  const [description, setDescription] = useState(prefillDescription ?? "");
  const [dateTime, setDateTime] = useState(prefillDateTime ?? "");
  const [venue, setVenue] = useState(prefillVenue ?? "");
  const createMutation = useCreateEvent();

  // Sync prefill props when they change (e.g. after AI plan is selected)
  useEffect(() => {
    if (prefillTitle !== undefined) setTitle(prefillTitle);
  }, [prefillTitle]);

  useEffect(() => {
    if (prefillDescription !== undefined) setDescription(prefillDescription);
  }, [prefillDescription]);

  useEffect(() => {
    if (prefillVenue !== undefined) setVenue(prefillVenue);
  }, [prefillVenue]);

  useEffect(() => {
    if (prefillDateTime !== undefined) setDateTime(prefillDateTime);
  }, [prefillDateTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ title, description, dateTime, venue });
    setTitle("");
    setDescription("");
    setDateTime("");
    setVenue("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          data-ocid="event.title.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          data-ocid="event.description.textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event"
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateTime">Date &amp; Time</Label>
          <Input
            id="dateTime"
            data-ocid="event.datetime.input"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">Venue / Link</Label>
          <Input
            id="venue"
            data-ocid="event.venue.input"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Location or online link"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        data-ocid="event.submit_button"
        disabled={createMutation.isPending}
        className="w-full"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Event"
        )}
      </Button>
    </form>
  );
}
