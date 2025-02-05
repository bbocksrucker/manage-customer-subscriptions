import { authenticate, login } from "../shopify.server";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);

  try {
    if (url.pathname === "/auth/callback") {
      const { session } = await authenticate.callback(request);
      return redirect("/app", {
        headers: {
          "Set-Cookie": await session.commit(),
        },
      });
    }

    return login(request);
  } catch (error) {
    console.error("Auth error:", error);
    return redirect("/auth/login");
  }
}

export async function action({ request }) {
  const url = new URL(request.url);
  
  try {
    if (url.pathname === "/auth/login") {
      return await login(request);
    }

    return await authenticate.callback(request);
  } catch (error) {
    console.error("Auth action error:", error);
    return redirect("/auth/login");
  }
}