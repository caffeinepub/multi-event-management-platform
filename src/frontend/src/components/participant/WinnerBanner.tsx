import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Event, Team } from '../../backend';

export default function WinnerBanner({ event, teams }: { event: Event; teams: Team[] }) {
  const winningTeam = teams.find(t => t.id === event.winningTeam);

  if (!winningTeam) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold">Winner Announced!</h2>
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg">
          Congratulations to <span className="font-bold text-primary">{winningTeam.name}</span>!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {winningTeam.members.length} team member{winningTeam.members.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Card>
  );
}
