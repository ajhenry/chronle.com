"use client";

import { trpc } from "@/server/trpc";
import { FC, useState } from "react";
import { useUser } from "reactfire";
import { ZodError } from "zod";
import { DaySchema } from "../types/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export const Dashboard: FC = () => {
  const { data } = useUser();
  const [uploadDay, setUploadDay] = useState<string>("");
  const [dayJSON, setDayJSON] = useState<string>("{}");
  const {
    mutate: submitDays,
    isPending: submitLoading,
    data: submitDaysData,
  } = trpc.uploadDays.useMutation();

  const handleDate = () => {
    try {
      return new Date(uploadDay).toISOString().split("T")[0];
    } catch (e) {
      return new Date(Date.now()).toISOString().split("T")[0];
    }
  };

  const validateJSON = (day: string) => {
    try {
      DaySchema.parse(JSON.parse(day));
      return null;
    } catch (error) {
      return JSON.stringify(
        (error as ZodError).errors ?? { data: "Invalid Schema" }
      );
    }
  };

  const handleSubmit = () => {
    console.log("submit");
    console.log(dayJSON);
    const days = DaySchema.parse(JSON.parse(dayJSON));

    submitDays([days]);
  };

  return (
    <div className="flex flex-col w-full max-w-[650px] mx-auto">
      <div className="flex items-end justify-between space-y-2 mb-6">
        <h2 className="text-3xl leading-5 font-bold tracking-tight">
          Day Dashboard
        </h2>
      </div>
      <div>
        <h3 className="text-xl font-semibold">
          Signed in as {data?.email ?? "loading..."}
        </h3>
        <h3 className="text-xl font-semibold mt-4">Day</h3>

        {submitLoading && <p>Submitting days...</p>}

        <Input
          placeholder="YYYY-MM-DD"
          onChange={(e) => {
            setUploadDay(e.target.value);
          }}
          defaultValue={new Date(Date.now()).toISOString().split("T")[0]}
        />
        <p>{handleDate()}</p>

        <h3 className="text-xl font-semibold mt-4">Day JSON</h3>
        <Textarea
          placeholder="Day JSON"
          rows={20}
          onChange={(e) => setDayJSON(e.target.value)}
        />
        <p>{validateJSON(dayJSON) ?? "Valid Schema"}</p>
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          Create Day
        </Button>

        <p className="mt-4">
          {submitDaysData && JSON.stringify(submitDaysData, null, 2)}
        </p>
      </div>
    </div>
  );
};
