import { GameArea } from "@/components/game-area";
import { Day, Event } from "@/components/types/types";
import { Button } from "@/components/ui/button";
import {
  adminAuth,
  getLatestSubmittedSolution,
  getToday,
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
  solution: [...events]
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0))
    .map((event) => event.id),
};

const getInitialDay = async () => {
  console.log("Getting initial day");
  // await uploadDays([uploadDay]);

  const day = await getToday();
  console.log("fetched day", { day });

  return day;
};

const getLatestSolution = async () => {
  console.log("Getting latest solution");
  const cookieStore = cookies();
  const firebaseAuthToken = cookieStore.get("auth")?.value;

  if (!firebaseAuthToken) {
    console.log("no auth token found for initial standing");
    return null;
  }

  console.log("verifying id token for initial standing");
  const token = await adminAuth
    .verifyIdToken(firebaseAuthToken)
    .catch((error) => {
      console.log("error verifying id token for initial standing", { error });
      return null;
    });

  if (!token) {
    console.log("no token found for initial standing");
    return null;
  }

  console.log("fetching latest solution for initial standing");
  const data = await getLatestSubmittedSolution(token.uid);

  console.log("fetched latest solution", { data });

  return data;
};

const Home = async () => {
  const day = await getInitialDay();
  const latestSolution = await getLatestSolution();

  if (latestSolution && day) {
    // Set the order of events based on the last solution submitted
    day.events = latestSolution.solution.map(
      (eventId) => day.events.find((event) => event.id === eventId)!
    );
  }

  return (
    <div className="grow flex flex-col items-center justify-evenly">
      {day && <GameArea day={day} />}
      {!day && (
        <div className="flex flex-col items-center">
          <h3 className="max-w-4xl font-heading font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter">
            Game Error
          </h3>
          <p className="text-center px-12 sm:px-2 mt-2">
            Looks like there was an error while loading the Chronle, please
            check back later
          </p>
        </div>
      )}

      <section id="intro" className="space-y-6 mt-12">
        <div className="container flex flex-col items-center gap-8 text-center">
          <h1 className="max-w-4xl font-heading font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
            Chronle - A Daily Chronological Timeline Game
          </h1>
          <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            A daily game where you are given a set of events and need to put
            them in order of when they happened in the fewest moves possible.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Save your progress across devices by creating an account
            </p>
            <Link
              target="_blank"
              href="https://github.com/ajhenry/chronle"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="link">
                View Project on GitHub &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="space-y-6 mt-12">
        <div className="container flex flex-col items-center gap-8 text-center">
          <h2 className="max-w-4xl font-heading font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter">
            Frequent Questions
          </h2>
          <h3 className="max-w-4xl font-heading font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter">
            How to Play
          </h3>
          <p className="max-w-2xl leading-normal sm:text-xl sm:leading-8">
            Drag the events using the handle (6 dots on the right) to put them
            in order of when they happened. The top item is the earliest event
            and the bottom item is the latest event.
            <br />
            <br />
            Submit your solution with the submit button. Correct events will be
            highlighted in green. Once you get all events correct or run out of
            moves, the game ends.
          </p>
          <h3 className="max-w-4xl font-heading font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter">
            What is Chronle?
          </h3>
          <p className="max-w-2xl leading-normal sm:text-xl sm:leading-8">
            Chronle is a daily game where you are given a set of events and need
            to put them in chronological order. You are given 6 moves to put the
            events in order.
          </p>
          <h3 className="max-w-4xl font-heading font-semibold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter">
            When does the game reset?
          </h3>
          <p className="max-w-2xl leading-normal sm:text-xl sm:leading-8">
            Every night at midnight UTC the game will reset with a new set of
            events. You can only play the game once per day.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
