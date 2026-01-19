import { data, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/server";
import prisma from "~/lib/prisma.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return data({ error: "Endpoint required" }, { status: 400 });
    }

    // Delete the subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: userData.user.id,
      },
    });

    return data({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return data({ error: "Failed to remove subscription" }, { status: 500 });
  }
}

// No loader - API-only route
export function loader() {
  return redirect("/");
}
