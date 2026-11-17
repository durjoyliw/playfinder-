import { StatusScreen } from "@/components/system/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="Nothing here"
      description="That page doesn't exist, or it was removed. If a link in the app brought you here, tell us via Send feedback."
      homeHref="/home"
      homeLabel="Back to the feed"
    />
  );
}
