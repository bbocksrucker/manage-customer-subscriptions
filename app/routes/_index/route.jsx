
import { Form, useLoaderData } from "@remix-run/react";
import styles from "./styles.module.css";
import { redirect } from "@remix-run/node";
import { authenticate } from "../../shopify.server";


export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const isEmbedded = url.searchParams.get("embedded") === "1";

    const auth = await authenticate.admin(request);

    console.log("DEBUG AUTH:", auth);

    if (!auth || !auth.admin) {
      console.log("❌ Nutzer nicht eingeloggt, leite zu /auth weiter");

      // Falls wir in einem iFrame sind, nutze Exit-Redirect
      if (isEmbedded) {
        return redirect(
          `/auth/exit-iframe?shop=afreshed-dev-store.myshopify.com`
        );
      }

      // Falls nicht im iFrame, zur normalen Auth-Seite leiten
      return redirect("/auth");
    }

    if (url.pathname === "/dashboard") {
      return null;
    }

    console.log("✅ Nutzer eingeloggt, weiterleiten zu /dashboard");
    return redirect("/dashboard");
  } catch (error) {
    console.error("❌ Fehler in der Authentifizierung:", error);
    // alert("Fehler in der Authentifizierung, bitte erneut versuchen.");
    return redirect("/dashboard");
    return redirect("/auth");

  }
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
