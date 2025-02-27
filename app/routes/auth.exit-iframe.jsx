import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return redirect("/auth");
  }

  return redirect(
    `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_orders&redirect_uri=${process.env.APP_URL}/auth/callback`
  );
};
