"use client";

import { FC, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Dashboard: FC = () => {
  const [uploadDay, setUploadDay] = useState<string>("");

  const handleDate = () => {
    console.log(uploadDay);
    try {
      return new Date(uploadDay).toISOString().split("T")[0];
    } catch (e) {
      console.log(e);
      return new Date(Date.now()).toISOString().split("T")[0];
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between space-y-2 mb-6">
        <h2 className="text-3xl leading-5 font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Upload Day</h3>
        <Input
          placeholder="YYYY-MM-DD"
          onChange={(e) => {
            setUploadDay(e.target.value);
          }}
        />
        <p>{handleDate()}</p>

        <h3 className="text-xl font-semibold">Events JSON</h3>
        <textarea
          placeholder="YYYY-MM-DD"
          onChange={(e) => {
            setUploadDay(e.target.value);
          }}
        />

        <Button>Create Day</Button>
      </div>
    </div>
  );
};
