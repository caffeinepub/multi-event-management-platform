import { useState } from 'react';
import { useDeclareWinner } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import type { Team } from '../../backend';

export default function WinnerDeclarationDialog({ eventId, teams }: { eventId: string; teams: Team[] }) {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const declareMutation = useDeclareWinner();

  const handleDeclare = async () => {
    if (!selectedTeam) return;
    await declareMutation.mutateAsync({ eventId, teamId: selectedTeam });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Trophy className="w-4 h-4" />
          Declare Winner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Declare Winning Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the team that won this event
          </p>
          <div className="space-y-2">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTeam === team.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{team.name}</div>
                <div className="text-sm text-muted-foreground">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeclare}
              disabled={!selectedTeam || declareMutation.isPending}
            >
              {declareMutation.isPending ? 'Declaring...' : 'Declare Winner'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
