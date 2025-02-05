import { authenticate } from "../../shopify.server";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  try {
    await authenticate.admin(request);
    return redirect("/app");
  } catch (error) {
    return authenticate.login(request);
  }
}

export async function action({ request }) {
  try {
    const authResponse = await authenticate.login(request);
    return authResponse;
  } catch (error) {
    console.error("Login error:", error);
    return new Response(error.message, { status: 500 });
  }
}