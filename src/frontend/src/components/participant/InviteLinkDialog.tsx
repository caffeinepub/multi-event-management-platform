import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Mail } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { Team, Event } from '../../backend';
import { toast } from 'sonner';

export default function InviteLinkDialog({ team, event }: { team: Team; event: Event }) {
  const [open, setOpen] = useState(false);
  const inviteUrl = `${window.location.origin}/join-team/${team.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Join my team for ${event.title}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to join my team "${team.name}" for the event "${event.title}".\n\nClick here to join: ${inviteUrl}\n\nSee you there!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Join my team "${team.name}" for ${event.title}!\n\n${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invitation Link</label>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly />
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Share via</label>
            <div className="flex gap-2">
              <Button onClick={handleEmail} variant="outline" className="flex-1 gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button onClick={handleWhatsApp} variant="outline" className="flex-1 gap-2">
                <SiWhatsapp className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
