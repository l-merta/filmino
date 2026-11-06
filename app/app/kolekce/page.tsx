import { redirect } from "next/navigation";

// The old "My collections" page now lives on the profile page.
export default function Page() {
  redirect("/profil");
}
