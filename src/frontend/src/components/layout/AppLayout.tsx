import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useNavigate, useLocation } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Home } from 'lucide-react';
import { UserRole } from '../../backend';
import { SiX, SiFacebook, SiLinkedin } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!identity;
  const isOrganizer = userProfile?.role === UserRole.organizer;
  const isParticipant = userProfile?.role === UserRole.participant;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            >
              <Calendar className="w-6 h-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Campus EventHub
              </span>
            </button>
            {isAuthenticated && userProfile && (
              <nav className="hidden md:flex items-center gap-2">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation('/')}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
                {isOrganizer && (
                  <Button
                    variant={location.pathname === '/organizer' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigation('/organizer')}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    My Events
                  </Button>
                )}
                {isParticipant && (
                  <Button
                    variant={location.pathname === '/participant' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigation('/participant')}
                    className="gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Browse Events
                  </Button>
                )}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-semibold">{userProfile.name}</span>
              </div>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Campus EventHub
              </h3>
              <p className="text-sm text-muted-foreground">
                Smart web solution for hosting and managing college events with ease.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => handleNavigation('/')} className="hover:text-foreground transition-colors">
                    Home
                  </button>
                </li>
                {isOrganizer && (
                  <li>
                    <button onClick={() => handleNavigation('/organizer')} className="hover:text-foreground transition-colors">
                      Organizer Dashboard
                    </button>
                  </li>
                )}
                {isParticipant && (
                  <li>
                    <button onClick={() => handleNavigation('/participant')} className="hover:text-foreground transition-colors">
                      Browse Events
                    </button>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiX className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <SiLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Campus EventHub. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
