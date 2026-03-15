import AuthForm from "@/components/AuthForm";
import DashboardMain from "@/components/DashboardMain";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, show Auth form
  if (!user) {
    return <AuthForm />;
  }

  const logoutAction = async () => {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
  };

  return <DashboardMain logoutAction={logoutAction} />;
}
