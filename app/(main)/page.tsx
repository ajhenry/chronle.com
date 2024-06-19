import { GameArea } from "@/components/game-area";
import { Button } from "@/components/ui/button";
import { createUserData } from "@/lib/browser-firebase";
import { seedDay, seedUser } from "@/lib/seed";
import {
  adminAuth,
  getLatestSubmittedSolution,
  getToday,
  uploadDays,
} from "@/lib/server-firebase";
import { cookies } from "next/headers";
import Link from "next/link";

const seedDatabase = async () => {
  await uploadDays([seedDay]);
  await createUserData(seedUser);
};

const getInitialDay = async () => {
  console.log("Getting initial day");

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
  if (process.env.NODE_ENV === "development") {
    console.log("Seeding the day for development");
    await seedDatabase();
  }

  const day = await getInitialDay();

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
