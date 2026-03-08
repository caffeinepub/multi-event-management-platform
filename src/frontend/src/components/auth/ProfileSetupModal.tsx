import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UserRole } from "../../backend";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    saveProfile.mutate({
      name,
      email,
      role,
    });
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Welcome to Campus EventHub
          </DialogTitle>
          <DialogDescription>
            Please complete your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@college.edu"
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Select Your Role</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole(UserRole.organizer)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  role === UserRole.organizer
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src="/assets/generated/icon-organizer.dim_128x128.png"
                  alt="Organizer"
                  className="w-16 h-16"
                />
                <span className="font-semibold">Organizer</span>
                <span className="text-xs text-muted-foreground text-center">
                  Create and manage events
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.participant)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  role === UserRole.participant
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src="/assets/generated/icon-participant.dim_128x128.png"
                  alt="Participant"
                  className="w-16 h-16"
                />
                <span className="font-semibold">Participant</span>
                <span className="text-xs text-muted-foreground text-center">
                  Join events and teams
                </span>
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name || !email || !role || saveProfile.isPending}
          >
            {saveProfile.isPending ? "Creating Profile..." : "Complete Setup"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
