import { HomeAuthRedirect } from "@/components/home/home-auth-redirect";
import { HomeLanding } from "@/components/home/home-landing";

export default function HomePage() {
  return (
    <>
      <HomeLanding />
      <HomeAuthRedirect />
    </>
  );
}
