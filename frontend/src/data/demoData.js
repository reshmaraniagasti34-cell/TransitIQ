/**
 * TransitIQ Centralized Pilot Corridor Waypoints
 * Source of truth for pilot route definitions across components.
 */

export const PILOT_CORRIDOR = {
  id: "SH-VIT-01",
  name: "Sehore – Kubreshwar Dham – VIT Bhopal Pilot Corridor",
  code: "SH-VIT-01",
  type: "Suburban & Intercity Pilot Corridor",
  stops: [
    { id: "s1", name: "Sehore Bus Stand", sequence: 1 },
    { id: "s2", name: "Kubreshwar Dham", sequence: 2 },
    { id: "s3", name: "Amlaha", sequence: 3 },
    { id: "s4", name: "Toll Plaza", sequence: 4 },
    { id: "s5", name: "VIT Bhopal Outer Highway", sequence: 5 }
  ]
};

export const PROJECT_INFO = {
  title: "Resilient Transit Intelligence for Small-City Bus Networks",
  shortTitle: "TransitIQ",
  subtitle: "B.Tech CSE Project Exhibition Prototype",
  institution: "Department of Computer Science & Engineering",
  corePrinciple: "No live signal does not mean no useful information."
};
