import { Day, Event, User } from "@/components/types/types";

export const seedUser: User = {
  uid: "admin",
  email: "admin@chronle.com",
  displayName: "Admin",
  isAnonymous: false,
  stats: {
    totalDays: 0,
    solvedMetrics: {},
  },
  solvedDays: {},
  admin: true,
};

export const seedEvents: Event[] = [
  {
    id: "2hqeB3fbq3KQd3zjCszinWcoPne",
    name: "The first Krispy Kreme Donut was invented",
    image:
      "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9udXR8ZW58MHx8MHx8fDA%3D",
    date: "1937-07-13",
    topic: "Krispy Kreme",
    categories: ["Food", "Donuts", "Invention"],
    imageCredit: {
      name: "Billy Bob",
      url: "https://unsplash.com/@billybob",
    },
  },
  {
    id: "2hqeB0O8GjkUAE7JEC2OypmhU13",
    name: "The first Hot Air balloon flight",
    image:
      "https://images.unsplash.com/photo-1617415420840-48518720fe26?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "1783-11-21",
    topic: "Hot Air Balloon",
    categories: ["Flight", "Invention"],
    imageCredit: {
      name: "Billy Bob",
      url: "https://unsplash.com/@billybob",
    },
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYt5L6Ewh",
    name: "The last time the Cubs won the World Series",
    image:
      "https://images.unsplash.com/photo-1519407451944-22e820099775?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2016-11-02",
    topic: "Chicago Cubs",
    categories: ["Baseball", "Sports", "Championship"],
    imageCredit: {
      name: "Billy Bob",
      url: "https://unsplash.com/@billybob",
    },
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYt5L6Ezh",
    name: "When Coke Zero was first introduced",
    image:
      "https://images.unsplash.com/photo-1583683433877-042a75ba47e3?q=80&w=2698&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2005-06-09",
    topic: "Coke Zero",
    categories: ["Soda", "Coca Cola", "Invention"],
    imageCredit: {
      name: "Billy Bob",
      url: "https://unsplash.com/@billybob",
    },
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYv5L6Ezh",
    name: "When Toys R Us filed for bankruptcy",
    image:
      "https://images.unsplash.com/photo-1564470939458-1289338e2d85?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2017-09-18",
    topic: "Toys R Us",
    categories: ["Toys", "Retail", "Bankruptcy"],
    imageCredit: {
      name: "Billy Bob",
      url: "https://unsplash.com/@billybob",
    },
  },
];

export const seedDay: Day = {
  id: "2hqeB0ia52vGLnmSNlvYt5L6Ewh",
  day: new Date().toISOString().split("T")[0],
  name: "Events",
  description: "Seed events",
  events: seedEvents,
  solution: [...seedEvents]
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0))
    .map((event) => event.id),
};
