import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Trophy, BarChart3, Bell, FileText } from 'lucide-react';
import { UserRole } from '../backend';
import { useEffect } from 'react';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      if (userProfile.role === UserRole.organizer) {
        navigate({ to: '/organizer' });
      } else if (userProfile.role === UserRole.participant) {
        navigate({ to: '/participant' });
      }
    }
  }, [isAuthenticated, userProfile, navigate]);

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage multiple events with schedules, venues, and details',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Form teams, invite members, and collaborate seamlessly',
    },
    {
      icon: Trophy,
      title: 'Winner Declaration',
      description: 'Declare winning teams and celebrate achievements',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track registrations, attendance, and event statistics',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Send updates and reminders to participants via email and WhatsApp',
    },
    {
      icon: FileText,
      title: 'Export Reports',
      description: 'Generate and download participant reports and attendance data',
    },
  ];

  return (
    <div className="container py-12">
      <div className="relative rounded-2xl overflow-hidden mb-16">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Campus EventHub"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">Multi-Event Management Platform</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Smart web solution for hosting and managing college events with ease
            </p>
            {!isAuthenticated && (
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started - Login to Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Key Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to organize successful college events, hackathons, and fests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join Campus EventHub today and streamline your event management process
        </p>
        {!isAuthenticated && (
          <Button size="lg" className="text-lg px-8">
            Login with Internet Identity
          </Button>
        )}
      </div>
    </div>
  );
}
