import { adminAuth, adminDB } from "@/lib/server-firebase";
import { TRPCError, initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import superjson from "superjson";

export const createContext = async () => {
  // const session = await getServerSession(opts.req, opts.res, nextAuthOptions)
  const cookieStore = cookies();
  const firebaseAuthToken = cookieStore.get("auth")?.value!;

  const uid = await adminAuth
    .verifyIdToken(firebaseAuthToken)
    .then((decodedToken) => {
      return decodedToken.uid;
    })
    .catch((error) => {
      console.log("error", { error });
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid Firebase Auth Token",
      });
    });

  return {
    uid,
    db: adminDB,
  };
};

export const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

const verifyAuth: Middleware = (opts) => {
  return opts.next({
    ...opts,
  });
};

// Base router and procedure helpers
export const router = t.router;
const publicProcedure = t.procedure;
export type Middleware = Parameters<(typeof t.procedure)["use"]>[0];
// Used for general user access token verification
export const procedure = publicProcedure.use(verifyAuth);
