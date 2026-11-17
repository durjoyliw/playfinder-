import { BETA_CITY } from "@/lib/beta";
import { redirect } from "next/navigation";
import { LocationForm } from "../location-form";

export default function Page() {
  // Glasgow-only during the beta: nothing to choose here.
  if (BETA_CITY) redirect("/settings");
  return <LocationForm />;
}
