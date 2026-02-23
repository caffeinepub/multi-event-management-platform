import { useGetEventRegistrations, useGetEventTeams, useGetCheckedInParticipants, useGetEvent } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportReportButton({ eventId }: { eventId: string }) {
  const { actor } = useActor();
  const { data: event } = useGetEvent(eventId);
  const { data: registrations = [] } = useGetEventRegistrations(eventId);
  const { data: teams = [] } = useGetEventTeams(eventId);
  const { data: checkedIn = [] } = useGetCheckedInParticipants(eventId);

  const handleExport = async () => {
    if (!event || !actor) return;

    try {
      const rows = [
        ['Principal ID', 'Team', 'Check-in Status'],
      ];

      for (const principal of registrations) {
        const team = teams.find(t => t.members.some(m => m.toString() === principal.toString()));
        const isCheckedIn = checkedIn.some(p => p.toString() === principal.toString());

        // Fetch user profile for this principal
        let userName = 'Unknown';
        try {
          const profile = await actor.getUserProfile(principal);
          if (profile) {
            userName = profile.name;
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }

        rows.push([
          userName,
          team?.name || 'No team',
          isCheckedIn ? 'Checked In' : 'Not Checked In',
        ]);
      }

      const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, '_')}_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="w-4 h-4" />
      Export Report
    </Button>
  );
}
