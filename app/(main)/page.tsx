import { GameArea } from "@/components/game-area";
import { Day, Event } from "@/components/types/types";
import { Button } from "@/components/ui/button";
import {
  adminAuth,
  getLatestSubmittedSolution,
  getToday,
  getUser,
  uploadDays,
} from "@/lib/server-firebase";
import { cookies } from "next/headers";
import Link from "next/link";

const events: Event[] = [
  {
    id: "2hqeB3fbq3KQd3zjCszinWcoPne",
    name: "The first Krispy Kreme Donut was invented",
    image:
      "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9udXR8ZW58MHx8MHx8fDA%3D",
    date: "1937-07-13",
  },
  {
    id: "2hqeB0O8GjkUAE7JEC2OypmhU13",
    name: "The first Hot Air balloon flight",
    image:
      "https://images.unsplash.com/photo-1617415420840-48518720fe26?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "1783-11-21",
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYt5L6Ewh",
    name: "The last time the Cubs won the World Series",
    image:
      "https://images.unsplash.com/photo-1519407451944-22e820099775?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2016-11-02",
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYt5L6Ezh",
    name: "When Coke Zero was first introduced",
    image:
      "https://images.unsplash.com/photo-1583683433877-042a75ba47e3?q=80&w=2698&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2005-06-09",
  },
  {
    id: "2hqeB0ia52vGLnmSNlvYv5L6Ezh",
    name: "When Toys R Us filed for bankruptcy",
    image:
      "https://images.unsplash.com/photo-1564470939458-1289338e2d85?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    date: "2017-09-18",
  },
];

const uploadDay: Day = {
  day: "2024-06-15",
  description: "Put the items in order",
  events: events,
  id: "2hqeB0ia52vGLnmSNlvYt5L6Ewh",
  name: "Events",
  solution: events
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0))
    .map((event) => event.id),
};

const getInitialDay = async () => {
  await uploadDays([uploadDay]);
  return await getToday();
};

const getUserData = async () => {
  const cookieStore = cookies();
  const firebaseAuthToken = cookieStore.get("auth")?.value;

  if (!firebaseAuthToken) {
    return null;
  }

  const token = await adminAuth
    .verifyIdToken(firebaseAuthToken)
    .catch((error) => {
      console.log("error verifying id token for initial standing", { error });
      return null;
    });

  if (!token) {
    return null;
  }

  return await getUser(token.uid);
};

const getLatestSolution = async () => {
  const cookieStore = cookies();
  const firebaseAuthToken = cookieStore.get("auth")?.value;

  if (!firebaseAuthToken) {
    return null;
  }

  const token = await adminAuth
    .verifyIdToken(firebaseAuthToken)
    .catch((error) => {
      console.log("error verifying id token for initial standing", { error });
      return null;
    });

  if (!token) {
    return null;
  }

  return await getLatestSubmittedSolution(token.uid);
};

const Home = async () => {
  const day = await getInitialDay();
  const userData = await getUserData();
  const latestSolution = await getLatestSolution();

  if (latestSolution) {
    // Set the order of events based on the last solution submitted
    day.events = latestSolution.solution.map(
      (eventId) => day.events.find((event) => event.id === eventId)!
    );
  }

  return (
    <div className="grow flex flex-col items-center justify-evenly">
      <GameArea day={day} />

      <section className="space-y-6 mt-12">
        <div className="container flex flex-col items-center gap-8 text-center">
          <h1 className="max-w-4xl font-heading font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
            Chrondle - A Daily Event Timeline Game
          </h1>
          <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Boilerplate &amp; template for React projects using Next.js,
            shadcn/ui, Tailwind and Firebase...and TypeScript, of course!
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">Call to Action!</Button>
            </Link>
            <Link target="_blank" href="https://github.com/enesien/venefish">
              <Button size="lg" variant="link">
                View Project on GitHub &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
