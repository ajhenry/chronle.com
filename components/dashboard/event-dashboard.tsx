"use client";

import { trpc } from "@/server/trpc";
import { FC, useState } from "react";
import { useUser } from "reactfire";
import { ZodError, z } from "zod";
import { EventSchema } from "../types/types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const EventsDashboard: FC = () => {
  const { data } = useUser();
  const [eventJSON, setEventJSON] = useState<string>("{}");

  const {
    mutateAsync: submitEvents,
    isPending: submitLoading,
    data: submitEventsData,
  } = trpc.uploadEvents.useMutation();

  const validateJSON = (events: string) => {
    try {
      z.array(EventSchema).parse(JSON.parse(events));
      return null;
    } catch (error) {
      return JSON.stringify(
        (error as ZodError).errors ?? { data: "Invalid Schema" }
      );
    }
  };

  const handleSubmit = async () => {
    console.log("submit");
    console.log(eventJSON);
    const events = z.array(EventSchema).parse(JSON.parse(eventJSON));
    // chunk them up 10 at a time
    while (events.length) {
      const currentChunk = events.splice(0, 10);
      await submitEvents(currentChunk);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[650px] mx-auto">
      <div className="flex items-end justify-between space-y-2 mb-6">
        <h2 className="text-3xl leading-5 font-bold tracking-tight">
          Event Dashboard
        </h2>
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          Signed in as {data?.email ?? "loading..."}
        </h3>
        {submitLoading && <p>Submitting events...</p>}

        <h3 className="text-xl font-semibold mt-4">Event JSON</h3>
        <Textarea
          placeholder="Events JSON"
          rows={20}
          onChange={(e) => setEventJSON(e.target.value)}
        />
        <p>{validateJSON(eventJSON) ?? "Valid Schema"}</p>
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          Create Events
        </Button>

        <p className="mt-4">
          {submitEventsData && JSON.stringify(submitEventsData, null, 2)}
        </p>
      </div>
    </div>
  );
};
