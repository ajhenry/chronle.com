import { z } from "zod";

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  date: z.string().optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const DaySchema = z.object({
  id: z.string(),
  day: z.string(),
  name: z.string(),
  description: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
      date: z.string().optional(),
    })
  ),
  solution: z.array(z.string()),
});

export type Day = z.infer<typeof DaySchema>;

export const SolutionSchema = z.object({
  day: z.string(),
  solution: z.array(z.string()),
});

export type Solution = z.infer<typeof SolutionSchema>;

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  solvedDays: z.record(
    z.string(),
    z.object({
      solved: z.boolean(),
      timestamp: z.string(),
    })
  ),
  stats: z.object({
    totalDays: z.number(),
  }),
});

export type User = z.infer<typeof UserSchema>;

export const AttemptSchema = z.object({
  result: z.object({
    correct: z.array(z.boolean()),
    solved: z.boolean(),
  }),
  solution: z.array(z.string()),
  timestamp: z.string(),
});

export type Attempt = z.infer<typeof AttemptSchema>;
