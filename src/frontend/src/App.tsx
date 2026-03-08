import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ProfileSetupModal from "./components/auth/ProfileSetupModal";
import AppLayout from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import EventDetailsPage from "./pages/EventDetailsPage";
import JoinTeamPage from "./pages/JoinTeamPage";
import LandingPage from "./pages/LandingPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";

function RootComponent() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const organizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organizer",
  component: OrganizerDashboard,
});

const participantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/participant",
  component: ParticipantDashboard,
});

const eventDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/event/$eventId",
  component: EventDetailsPage,
});

const joinTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join-team/$teamId",
  component: JoinTeamPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  organizerRoute,
  participantRoute,
  eventDetailsRoute,
  joinTeamRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
