import {
  Day,
  DaySchema,
  EventSchema,
  SolutionSchema,
} from "@/components/types/types";
import { checkAnswer } from "@/lib/server-firebase";
import { getImageFromTopic } from "@/lib/unsplash";
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

      const metricsDay = standings.size > 5 ? 6 : standings.size;

      // Increment their stats for their profile
      if (res.solved || standings.size > 5) {
        await ctx.db
          .collection("users")
          .doc(uid)
          .set(
            {
              stats: {
                totalDays: FieldValue.increment(1),
                solvedMetrics: {
                  [metricsDay]: FieldValue.increment(1),
                },
              },
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
  uploadEvents: procedure
    .input(z.array(EventSchema))
    .mutation(async ({ input, ctx }) => {
      const currentMeta = await ctx.db.collection("meta").doc("events").get();
      const currentCount = currentMeta.data()?.count || 0;
      let addedCount = 0;

      try {
        for (const event of input) {
          const inputEvent = {
            ...event,
            id: KSUID.randomSync().string,
          };
          // We need to get an image from unsplash
          let img = await getImageFromTopic(inputEvent.topic);

          if (!img) {
            console.error("No image found for topic, trying category instead", {
              topic: inputEvent.topic,
              category: inputEvent.categories[0],
            });

            img = await getImageFromTopic(inputEvent.categories[0]);
          }

          if (!img) {
            console.error(
              "No image found for category either, skipping event",
              {
                topic: inputEvent.topic,
                category: inputEvent.categories[0],
              }
            );

            continue;
          }

          console.log("Got image", { ...img });

          const eventWithImage = {
            ...inputEvent,
            imageCredit: {
              name: img.name,
              url: img.unsplashProfile,
            },
            image: img.url,
          };

          console.log("Uploading event", { eventWithImage });

          await ctx.db
            .collection("events")
            .doc(String(currentCount + addedCount + 1))
            .set(eventWithImage);

          addedCount++;

          console.log("Uploaded event and incremented count", {
            addedCount,
            totalCount: currentCount + addedCount + 1,
          });
        }
      } catch (error) {
        console.error("Error uploading events", { error });
        console.log("Setting count to the new count", {
          currentCount,
          addedCount,
        });
      }

      await ctx.db
        .collection("meta")
        .doc("events")
        .set({
          count: FieldValue.increment(addedCount),
        });

      return { addedCount };
    }),
});

export const appRouter = t.mergeRouters(
  healthCheckerRouter,
  verifierRouter,
  adminRouter
);

export type AppRouter = typeof appRouter;
