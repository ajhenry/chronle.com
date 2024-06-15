"use client";

import { Attempt, Day, Event } from "@/components/types/types";
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
import { collection, getFirestore } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useUser } from "reactfire";
import { Button } from "./ui/button";

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
        <div className="w-full flex items-center h-12">
          <p>{props.event.name}</p>
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
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};

const PostGame = (props: { attempts: Attempt[] }) => {
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

  return (
    <div className="flex flex-col items-center space-y-4 mb-12 mt-4">
      <h1 className="text-3xl font-semibold">
        Next Game in {z(hours)}:{z(mins)}:{z(secs)}
      </h1>
      <p className="text-center">
        You have completed all the challenges for today. Come back tomorrow for
        more!
      </p>
    </div>
  );
};

interface GameAreaProps {
  day: Day;
}

export function GameArea({ day }: GameAreaProps) {
  const auth = getAuth(browserApp);
  const user = useUser();
  const [attemptData, attemptDataLoading, error] = useCollectionData<Attempt>(
    collection(
      getFirestore(browserApp),
      "attempts",
      day.day,
      auth.currentUser?.uid ?? "__MISSING__"
    ) as any
  );

  const latestAttempt = attemptData?.[attemptData?.length - 1];

  const {
    data: submittedSolution,
    isPending: submissionLoading,
    mutate,
  } = trpc.submitSolution.useMutation();
  const loading = submissionLoading || attemptDataLoading;
  const [items, setItems] = useState<Event[]>(day.events);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSubmit = () => {
    const solution = items.map((item) => item.id);
    mutate({ day: day.day, solution });
  };

  const attemptCount = attemptData?.length ?? 0;
  const postGame =
    attemptCount >= 6 ||
    Boolean(attemptData?.[attemptCount - 1]?.result.solved);

  useEffect(() => {
    if (postGame) {
      setItems(
        day.solution.map((eventId) => day.events.find((e) => e.id === eventId)!)
      );
    }
  }, [postGame]);

  useEffect(() => {
    if (user.status === "success" && !user.data && !user.error) {
      signInAnonymously(auth)
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

    if (user.data) {
      setCookie("auth", (user.data as any).accessToken);
    }
  }, [user]);

  return (
    <div className="md:w-[600px] px-2">
      {postGame && <PostGame attempts={attemptData ?? []} />}
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
