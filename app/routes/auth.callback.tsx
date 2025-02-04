import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.callback(request);
    if (!session) {
      throw new Error('No session found');
    }
    return redirect("/app", {
      headers: {
        "Set-Cookie": await session.commit()
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return redirect(`/auth?error=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
  }
}