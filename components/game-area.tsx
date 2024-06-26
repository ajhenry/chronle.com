"use client";

import { Attempt, Day, Event, User } from "@/components/types/types";
import { browserApp, createUserData } from "@/lib/browser-firebase";
import { cn } from "@/lib/utils";
import { trpc } from "@/server/trpc";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { setCookie } from "cookies-next";
import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, doc, getFirestore } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import pluralize from "pluralize";
import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterShareButton,
  XIcon,
} from "react-share";
import { useUser } from "reactfire";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const getDelay = (order: number) => {
  return `${order * 250}ms`;
};

export function SortableItem(props: {
  id: string;
  event: Event;
  order: number;
  attempt?: Attempt;
  postGame: boolean;
}) {
  const [previousIndex, setPreviousIndex] = useState(props.order);
  const [attempt, setAttempt] = useState<Attempt | null>();
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (previousIndex !== props.order) {
      setMoved(true);
      setPreviousIndex(props.order);
      setAttempt(null);
    }
  }, [props.order]);

  // Update the attempt data if it changes
  // This is used to determine if the user submitted another answer
  useEffect(() => {
    if (props.attempt !== attempt) {
      setMoved(false);
      setAttempt(props.attempt);
    }
  }, [props.attempt]);

  const correct =
    (attempt?.result.correct[props.order] &&
      attempt.solution[props.order] === props.id &&
      !moved) ||
    props.postGame;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id, disabled: props.postGame });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          correct
            ? "bg-success"
            : !moved && !correct && attempt
            ? "bg-accent"
            : "bg-background",
          "w-full border-border border-2 rounded-lg flex p-2 space-x-4 touch-manipulation transition duration-500 ease-in-out"
        )}
        style={{ transitionDelay: attempt ? getDelay(props.order) : "0ms" }}
      >
        <div>
          <Image
            src={props.event.image}
            alt={`${props.event.name} Image`}
            width="160"
            height={160}
            className="object-cover h-12 w-16 rounded-lg"
          />
        </div>
        <div className="w-full flex justify-center min-h-12 flex-col">
          <p>{props.event.name}</p>
          {props.postGame && (
            <p className="">{formatDate(props.event.date!)}</p>
          )}
        </div>
        <div
          className="w-10 flex items-center justify-center touch-none"
          {...attributes}
          {...listeners}
        >
          <div className="handle" />
        </div>
      </div>
    </div>
  );
}

// Returns in milliseconds
const getTimeTilMidnightUTC = () => {
  const now = new Date();
  const nowUTC = new Date(now.getTime());
  const midnightUTC = new Date(
    Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate() + 1,
      0,
      0,
      0
    )
  );

  return midnightUTC.getTime() - nowUTC.getTime();
};

const PostGame = (props: {
  day: Day;
  attemptCount: number;
  isWinner: boolean;
}) => {
  const user = useUser();

  const [userData] = useDocumentData<User>(
    doc(
      collection(getFirestore(browserApp), "users"),
      user.data?.uid ?? "__MISSING__"
    ) as any
  );
  const [countdown, setCountdown] = useState(getTimeTilMidnightUTC());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((countdown) => countdown - 1000);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const hours = (countdown / 3.6e6) | 0;
  const mins = ((countdown % 3.6e6) / 6e4) | 0;
  const secs = Math.round((countdown % 6e4) / 1e3);
  function z(n: number) {
    return (n < 10 ? "0" : "") + n;
  }

  const getWidthStyle = (size: number) =>
    ({ "--size": size } as React.CSSProperties);

  const highestTotalSolved = Object.values(
    userData?.stats?.solvedMetrics ?? {}
  ).reduce((acc, curr) => Math.max(acc, curr), 0);

  const getSolvedRatio = (s: number) => {
    if (!userData?.stats?.solvedMetrics?.[s]) {
      return 0.1;
    }

    const data = Math.min(
      userData?.stats?.solvedMetrics?.[s] ?? 0 / highestTotalSolved + 0.1,
      1
    );

    return data;
  };

  const getSolvedDayCount = (s: number) => {
    return userData?.stats?.solvedMetrics?.[s] ?? "0";
  };

  return (
    <div className="flex flex-col items-center space-y-4 mb-12 mt-4">
      <h1 className="text-3xl font-semibold">
        {props.isWinner ? "Congrats" : "Nice Try"}
      </h1>
      <h2 className="text-2xl font-semibold">
        {hours && mins && secs
          ? `Next Game in ${z(hours)}:${z(mins)}:${z(secs)}`
          : "Refresh the page to see the next game"}
      </h2>
      <p className="text-center">
        You have completed all the challenges for today. Come back tomorrow for
        more.
      </p>
      <div>
        <h3 className="text-center text-xl font-semibold">Your Stats</h3>
        <div id="stats" className="mx-auto w-[250px] mt-2">
          <table className="charts-css bar show-labels show-primary-axis labels-align-inline-center">
            <tbody>
              <tr className="ml-2">
                <th scope="row">1</th>
                <td style={getWidthStyle(getSolvedRatio(1))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(1)}
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td style={getWidthStyle(getSolvedRatio(2))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td style={getWidthStyle(getSolvedRatio(3))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(3)}
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">4</th>
                <td style={getWidthStyle(getSolvedRatio(4))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(4)}
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">5</th>
                <td style={getWidthStyle(getSolvedRatio(5))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(5)}
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">6+</th>
                <td style={getWidthStyle(getSolvedRatio(6))}>
                  <p className="absolute left-0 ml-[105%] w-full">
                    {getSolvedDayCount(6)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center">
          {userData?.stats?.totalDays}{" "}
          {pluralize("day", userData?.stats?.totalDays)} completed
        </p>
        <div className="flex flex-row justify-center items-center space-x-2 mt-2">
          <TwitterShareButton
            url="https://chronle.com/"
            title={`I completed the Chronle for ${new Date(
              props.day.day
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })} in ${props.attemptCount} 🤓`}
          >
            <XIcon className="h-10 w-10 rounded-full">
              https://chronle.com/
            </XIcon>
          </TwitterShareButton>
          <FacebookShareButton
            url="https://chronle.com/"
            title={`I completed the Chronle for ${new Date(
              props.day.day
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })} in ${props.attemptCount} 🤓`}
          >
            <FacebookIcon className="h-10 w-10 rounded-full">
              https://chronle.com/
            </FacebookIcon>
          </FacebookShareButton>
          <LinkedinShareButton
            url="chronle.com"
            title={`I completed the Chronle in ${props.attemptCount} 😎`}
            summary={`I completed the Chronle for ${new Date(
              props.day.day
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })} in ${props.attemptCount} 🤓`}
            source="https://chronle.com/"
          >
            <LinkedinIcon className="h-10 w-10 rounded-full" />
          </LinkedinShareButton>

          <EmailShareButton
            url="https://chronle.com/"
            subject={`Chronle for ${new Date(props.day.day).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}`}
            body={`I just completed the Chronle in ${props.attemptCount}`}
          >
            <EmailIcon className="h-10 w-10 rounded-full">
              https://chronle.com/
            </EmailIcon>
          </EmailShareButton>
        </div>
      </div>
    </div>
  );
};

interface GameAreaProps {
  day: Day;
}

export function GameArea({ day }: GameAreaProps) {
  const auth = getAuth(browserApp);
  const user = useUser();
  const [latestAttempt, latestAttemptLoading, error] = useDocumentData<Attempt>(
    doc(
      getFirestore(browserApp),
      "attempts",
      day.day,
      day.id,
      auth.currentUser?.uid ?? "__MISSING__"
    ) as any
  );

  const { isPending: submissionLoading, mutate } =
    trpc.submitSolution.useMutation();
  const loading = submissionLoading || latestAttemptLoading;
  const [items, setItems] = useState<Event[]>(day.events);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSubmit = async () => {
    const solution = items.map((item) => item.id);

    // only create a user if they submit a solution
    // there might be a race condition here between the user being created
    // and the solution being submitted but it's not a big deal
    if (user.status === "success" && !user.data && !user.error) {
      await signInAnonymously(auth)
        .then(async (data) => {
          console.log("signed in anonymously", { uid: data.user.uid });
          setCookie("auth", (data.user as any).accessToken);

          await createUserData({
            uid: data.user.uid,
            email: data.user.email,
            displayName: data.user.displayName,
            isAnonymous: true,
          });
        })
        .catch((error) => {
          console.log("error with anonymous sign in", { error });
        });
    }

    mutate({ day: day.day, solution, dayId: day.id });
  };

  const attemptCount = latestAttempt?.count ?? 0;
  const isWinner = Boolean(attemptCount <= 6);
  const postGame = attemptCount > 6 || Boolean(latestAttempt?.result.solved);

  useEffect(() => {
    if (postGame) {
      setItems(
        day.solution.map((eventId) => day.events.find((e) => e.id === eventId)!)
      );
    }
  }, [postGame]);

  useEffect(() => {
    if (user.data) {
      setCookie("auth", (user.data as any).accessToken);
    }
  }, [user]);

  const convertUnsplashUrl = (url: string) => {
    // Our link
    // https://api.unsplash.com/users/larrybridgesjr
    // Their link
    // https://unsplash.com/@andrewbphotos
    return url.replace(
      "https://api.unsplash.com/users/",
      "https://unsplash.com/@"
    );
  };

  return (
    <div className="md:w-[600px] px-2">
      {postGame && (
        <PostGame isWinner={isWinner} attemptCount={attemptCount} day={day} />
      )}
      <h3 className="text-lg text-center font-medium">{day.description}</h3>
      <p className="text-center text-sm">Oldest event first</p>
      <div className="mt-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          id="game-area"
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  order={index}
                  event={item}
                  attempt={latestAttempt}
                  postGame={postGame}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <p className="text-center text-sm mt-2">Most recent event last</p>
      {!postGame && (
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Submitting..." : `Submit (${6 - attemptCount} remaining)`}
        </Button>
      )}

      <div className="text-center">
        <Dialog>
          <DialogTrigger>
            <p className="text-center text-xs mt-2">View Photo Credits</p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Photo Credits</DialogTitle>
              <DialogDescription>
                <div className="text-left space-y-2">
                  {
                    <ul className="text-left space-y-2">
                      {day.events.map((event) => (
                        <li key={event.id}>
                          {event.name} -{" "}
                          <a
                            href={convertUnsplashUrl(event.imageCredit.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {event.imageCredit.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  }
                  <p className="mt-8">
                    All images from{" "}
                    <a href="https://unsplash.com" className="underline">
                      Unsplash
                    </a>
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((search) => search.id === active.id);
        const newIndex = items.findIndex((search) => search.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
