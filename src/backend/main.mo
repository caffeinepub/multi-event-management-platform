import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Types
  public type UserRole = {
    #organizer;
    #participant;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : UserRole;
  };

  // Event Types
  public type Event = {
    id : Text;
    title : Text;
    description : Text;
    dateTime : Text;
    venue : Text;
    organizer : Principal;
    registeredParticipants : [Principal];
    teams : [Text];
    winningTeam : ?Text;
  };

  // Team Types
  public type Team = {
    id : Text;
    name : Text;
    eventId : Text;
    creator : Principal;
    members : [Principal];
    inviteLink : Text;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let events = Map.empty<Text, Event>();
  let teams = Map.empty<Text, Team>();
  let eventRegistrations = Map.empty<Text, [Principal]>();
  let checkedInParticipants = Map.empty<Text, [Principal]>();
  var eventCounter : Nat = 0;
  var teamCounter : Nat = 0;

  // Helper Functions
  func generateEventId() : Text {
    eventCounter += 1;
    "event_" # eventCounter.toText();
  };

  func generateTeamId() : Text {
    teamCounter += 1;
    "team_" # teamCounter.toText();
  };

  func isOrganizer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#organizer) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isParticipant(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#participant) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isEventOrganizer(caller : Principal, eventId : Text) : Bool {
    switch (events.get(eventId)) {
      case (?event) { event.organizer == caller };
      case (null) { false };
    };
  };

  func isTeamCreator(caller : Principal, teamId : Text) : Bool {
    switch (teams.get(teamId)) {
      case (?team) { team.creator == caller };
      case (null) { false };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Event Management Functions
  public shared ({ caller }) func createEvent(title : Text, description : Text, dateTime : Text, venue : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create events");
    };
    if (not isOrganizer(caller)) {
      Runtime.trap("Unauthorized: Only organizers can create events");
    };

    let eventId = generateEventId();
    let event : Event = {
      id = eventId;
      title = title;
      description = description;
      dateTime = dateTime;
      venue = venue;
      organizer = caller;
      registeredParticipants = [];
      teams = [];
      winningTeam = null;
    };
    events.add(eventId, event);
    eventRegistrations.add(eventId, []);
    eventId;
  };

  public shared ({ caller }) func updateEvent(eventId : Text, title : Text, description : Text, dateTime : Text, venue : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update events");
    };
    if (not isEventOrganizer(caller, eventId)) {
      Runtime.trap("Unauthorized: Only the event organizer can update this event");
    };

    switch (events.get(eventId)) {
      case (?event) {
        let updatedEvent : Event = {
          id = event.id;
          title = title;
          description = description;
          dateTime = dateTime;
          venue = venue;
          organizer = event.organizer;
          registeredParticipants = event.registeredParticipants;
          teams = event.teams;
          winningTeam = event.winningTeam;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public shared ({ caller }) func deleteEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete events");
    };
    if (not isEventOrganizer(caller, eventId)) {
      Runtime.trap("Unauthorized: Only the event organizer can delete this event");
    };

    if (events.containsKey(eventId)) {
      events.remove(eventId);
    };

    if (eventRegistrations.containsKey(eventId)) {
      eventRegistrations.remove(eventId);
    };
  };

  public query func getEvent(eventId : Text) : async ?Event {
    events.get(eventId);
  };

  public query func getAllEvents() : async [Event] {
    Array.fromIter(events.values());
  };

  public query ({ caller }) func getMyEvents() : async [Event] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their events");
    };
    if (not isOrganizer(caller)) {
      Runtime.trap("Unauthorized: Only organizers can view their events");
    };

    Array.fromIter(events.values()).filter<Event>(func(event) { event.organizer == caller });
  };

  // Registration Functions
  public shared ({ caller }) func registerForEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for events");
    };
    if (not isParticipant(caller)) {
      Runtime.trap("Unauthorized: Only participants can register for events");
    };

    switch (events.get(eventId)) {
      case (?event) {
        let currentRegistrations = switch (eventRegistrations.get(eventId)) {
          case (?regs) { regs };
          case (null) { [] };
        };

        // Check if already registered
        if (currentRegistrations.find<Principal>(func(p) { p == caller }) != null) {
          Runtime.trap("Already registered for this event");
        };

        let newRegistrations = currentRegistrations.concat([caller]);
        eventRegistrations.add(eventId, newRegistrations);

        let updatedEvent : Event = {
          id = event.id;
          title = event.title;
          description = event.description;
          dateTime = event.dateTime;
          venue = event.venue;
          organizer = event.organizer;
          registeredParticipants = newRegistrations;
          teams = event.teams;
          winningTeam = event.winningTeam;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public shared ({ caller }) func unregisterFromEvent(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unregister from events");
    };

    switch (events.get(eventId)) {
      case (?event) {
        let currentRegistrations = switch (eventRegistrations.get(eventId)) {
          case (?regs) { regs };
          case (null) { [] };
        };

        let newRegistrations = currentRegistrations.filter(func(p) { p != caller });
        eventRegistrations.add(eventId, newRegistrations);

        let updatedEvent : Event = {
          id = event.id;
          title = event.title;
          description = event.description;
          dateTime = event.dateTime;
          venue = event.venue;
          organizer = event.organizer;
          registeredParticipants = newRegistrations;
          teams = event.teams;
          winningTeam = event.winningTeam;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public query func getEventRegistrations(eventId : Text) : async [Principal] {
    switch (eventRegistrations.get(eventId)) {
      case (?regs) { regs };
      case (null) { [] };
    };
  };

  // Team Management Functions
  public shared ({ caller }) func createTeam(eventId : Text, teamName : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create teams");
    };
    if (not isParticipant(caller)) {
      Runtime.trap("Unauthorized: Only participants can create teams");
    };

    // Verify event exists
    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?_) {};
    };

    // Verify caller is registered for the event
    let registrations = switch (eventRegistrations.get(eventId)) {
      case (?regs) { regs };
      case (null) { [] };
    };
    if (registrations.find<Principal>(func(p) { p == caller }) == null) {
      Runtime.trap("Must be registered for the event to create a team");
    };

    let teamId = generateTeamId();
    let inviteLink = "invite_" # teamId;
    let team : Team = {
      id = teamId;
      name = teamName;
      eventId = eventId;
      creator = caller;
      members = [caller];
      inviteLink = inviteLink;
    };
    teams.add(teamId, team);

    // Update event with team
    switch (events.get(eventId)) {
      case (?event) {
        let updatedEvent : Event = {
          id = event.id;
          title = event.title;
          description = event.description;
          dateTime = event.dateTime;
          venue = event.venue;
          organizer = event.organizer;
          registeredParticipants = event.registeredParticipants;
          teams = event.teams.concat([teamId]);
          winningTeam = event.winningTeam;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) {};
    };

    teamId;
  };

  public shared ({ caller }) func joinTeam(teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can join teams");
    };
    if (not isParticipant(caller)) {
      Runtime.trap("Unauthorized: Only participants can join teams");
    };

    switch (teams.get(teamId)) {
      case (?team) {
        // Verify caller is registered for the event
        let registrations = switch (eventRegistrations.get(team.eventId)) {
          case (?regs) { regs };
          case (null) { [] };
        };
        if (registrations.find<Principal>(func(p) { p == caller }) == null) {
          Runtime.trap("Must be registered for the event to join a team");
        };

        // Check if already a member
        if (team.members.find<Principal>(func(p) { p == caller }) != null) {
          Runtime.trap("Already a member of this team");
        };

        let updatedTeam : Team = {
          id = team.id;
          name = team.name;
          eventId = team.eventId;
          creator = team.creator;
          members = team.members.concat([caller]);
          inviteLink = team.inviteLink;
        };
        teams.add(teamId, updatedTeam);
      };
      case (null) { Runtime.trap("Team not found") };
    };
  };

  public shared ({ caller }) func leaveTeam(teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can leave teams");
    };

    switch (teams.get(teamId)) {
      case (?team) {
        if (team.creator == caller) {
          Runtime.trap("Team creator cannot leave the team");
        };

        let updatedTeam : Team = {
          id = team.id;
          name = team.name;
          eventId = team.eventId;
          creator = team.creator;
          members = team.members.filter<Principal>(func(p) { p != caller });
          inviteLink = team.inviteLink;
        };
        teams.add(teamId, updatedTeam);
      };
      case (null) { Runtime.trap("Team not found") };
    };
  };

  public query func getTeam(teamId : Text) : async ?Team {
    teams.get(teamId);
  };

  public query func getEventTeams(eventId : Text) : async [Team] {
    Array.fromIter(teams.values()).filter<Team>(func(team) { team.eventId == eventId });
  };

  // Winner Declaration
  public shared ({ caller }) func declareWinner(eventId : Text, teamId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can declare winners");
    };
    if (not isEventOrganizer(caller, eventId)) {
      Runtime.trap("Unauthorized: Only the event organizer can declare winners");
    };

    // Verify team exists and belongs to event
    switch (teams.get(teamId)) {
      case (?team) {
        if (team.eventId != eventId) {
          Runtime.trap("Team does not belong to this event");
        };
      };
      case (null) { Runtime.trap("Team not found") };
    };

    switch (events.get(eventId)) {
      case (?event) {
        let updatedEvent : Event = {
          id = event.id;
          title = event.title;
          description = event.description;
          dateTime = event.dateTime;
          venue = event.venue;
          organizer = event.organizer;
          registeredParticipants = event.registeredParticipants;
          teams = event.teams;
          winningTeam = ?teamId;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  // Check-in Functions
  public shared ({ caller }) func checkIn(eventId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check in");
    };
    if (not isParticipant(caller)) {
      Runtime.trap("Unauthorized: Only participants can check in");
    };

    // Verify registered for event
    let registrations = switch (eventRegistrations.get(eventId)) {
      case (?regs) { regs };
      case (null) { [] };
    };
    if (registrations.find<Principal>(func(p) { p == caller }) == null) {
      Runtime.trap("Must be registered for the event to check in");
    };

    let currentCheckedIn = switch (checkedInParticipants.get(eventId)) {
      case (?checked) { checked };
      case (null) { [] };
    };

    if (currentCheckedIn.find<Principal>(func(p) { p == caller }) != null) {
      Runtime.trap("Already checked in");
    };

    let newCheckedIn = currentCheckedIn.concat([caller]);
    checkedInParticipants.add(eventId, newCheckedIn);
  };

  public query ({ caller }) func getCheckedInParticipants(eventId : Text) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view check-ins");
    };
    if (not isEventOrganizer(caller, eventId)) {
      Runtime.trap("Unauthorized: Only the event organizer can view check-ins");
    };

    switch (checkedInParticipants.get(eventId)) {
      case (?checked) { checked };
      case (null) { [] };
    };
  };

  // Analytics Functions
  public query ({ caller }) func getEventStatistics(eventId : Text) : async {
    registrationCount : Nat;
    teamCount : Nat;
    checkInCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view statistics");
    };
    if (not isEventOrganizer(caller, eventId)) {
      Runtime.trap("Unauthorized: Only the event organizer can view statistics");
    };

    let registrations = switch (eventRegistrations.get(eventId)) {
      case (?regs) { regs };
      case (null) { [] };
    };

    let eventTeams = Array.fromIter(teams.values()).filter(func(team) { team.eventId == eventId });

    let checkedIn = switch (checkedInParticipants.get(eventId)) {
      case (?checked) { checked };
      case (null) { [] };
    };

    {
      registrationCount = registrations.size();
      teamCount = eventTeams.size();
      checkInCount = checkedIn.size();
    };
  };
};
