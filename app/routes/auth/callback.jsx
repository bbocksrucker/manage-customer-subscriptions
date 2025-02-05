import { authenticate } from "../../shopify.server";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.callback(request);
    return redirect("/app", {
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return redirect("/auth/login");
  }
}