import { Day, DaySchema, SolutionSchema } from "@/components/types/types";
import { checkAnswer } from "@/lib/server-firebase";
import { FieldValue } from "firebase-admin/firestore";
import KSUID from "ksuid";
import { z } from "zod";
import { procedure, t } from "./server";

export const healthCheckerRouter = t.router({
  healthChecker: procedure.query(() => {
    return "ok";
  }),
});

export const verifierRouter = t.router({
  submitSolution: procedure
    .input(SolutionSchema)
    .mutation(async ({ ctx, input }) => {
      const { uid } = ctx;
      const timestamp = new Date().toISOString();
      const attemptId = KSUID.randomSync().string;

      const res = await checkAnswer(input.day, input.solution);

      // Write to the database for attempts
      await ctx.db
        .collection(`attempts/${input.day}/${uid}`)
        .doc(attemptId)
        .set({
          solution: input.solution,
          timestamp,
          result: res,
        });

      // Now get the standings
      const standings = await ctx.db
        .collection(`attempts/${input.day}/${uid}`)
        .get();

      // Increment their stats for their profile
      if (res.solved) {
        await ctx.db
          .collection("users")
          .doc(uid)
          .set(
            {
              stats: { totalDays: FieldValue.increment(1) },
              solvedDays: {
                [input.day]: {
                  solved: true,
                  timestamp,
                  attempts: standings.size,
                },
              },
            },
            { merge: true }
          );
      }

      return {
        lastAttempt: { solution: input.solution, timestamp, result: res },
        attempts: standings.size,
        solved: res.solved,
      };
    }),
});

export const adminRouter = t.router({
  uploadDays: procedure
    .input(z.array(DaySchema))
    .mutation(async ({ input, ctx }) => {
      const days = input.map(async (day) => {
        const events = day.events
          .map((event) => ({
            ...event,
            id: KSUID.randomSync().string,
          }))
          .sort(() => Math.random() - 0.5);
        const inputDay: Day = {
          ...day,

          // fix the id to a proper KSUID
          id: KSUID.randomSync().string,

          // fix all the events to have a proper KSUID
          // also jumble up the days so that they are in a completely different order
          events: events,

          // fix each solution to ensure it matches dates listed in events
          solution: [...events]
            .sort((a, b) =>
              a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0
            )
            .map((event) => event.id),
        };

        await ctx.db.collection("days").doc(day.day).set(inputDay);

        return inputDay;
      });

      const daysCreated = await Promise.all(days);

      return daysCreated;
    }),
});

export const appRouter = t.mergeRouters(
  healthCheckerRouter,
  verifierRouter,
  adminRouter
);

export type AppRouter = typeof appRouter;
