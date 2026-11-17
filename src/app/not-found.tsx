import { StatusScreen } from "@/components/system/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="Nothing here"
      description="That page doesn't exist, or it was removed."
    />
  );
}
