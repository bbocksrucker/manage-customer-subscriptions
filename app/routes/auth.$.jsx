import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const { session } = await authenticate.callback(request);

  if (!session) {
    return redirect("/auth/login");
  }

  // Speichern Sie die Session und leiten Sie zur App weiter
  return redirect("/app", {
    headers: {
      "Set-Cookie": await session.commit(),
    },
  });
}