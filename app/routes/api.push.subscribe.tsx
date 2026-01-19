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
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return data({ error: "Invalid subscription data" }, { status: 400 });
    }

    // Upsert subscription (update if endpoint exists, create if new)
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: userData.user.id,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: userData.user.id,
      },
    });

    return data({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return data({ error: "Failed to save subscription" }, { status: 500 });
  }
}

// No loader - API-only route
export function loader() {
  return redirect("/");
}
