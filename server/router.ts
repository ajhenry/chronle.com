import { SolutionSchema } from "@/components/types/types";
import { checkAnswer } from "@/lib/server-firebase";
import { FieldValue } from "firebase-admin/firestore";
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

      const res = await checkAnswer(input.day, input.solution);

      // Write to the database for attempts
      await ctx.db.collection(`attempts/${input.day}/${uid}`).add({
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

export const appRouter = t.mergeRouters(healthCheckerRouter, verifierRouter);

export type AppRouter = typeof appRouter;
