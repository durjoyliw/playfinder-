"use client";

import { PageBackHeader } from "@/components/playfinder/page-back-header";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { isPushSupported, urlBase64ToUint8Array } from "@/lib/push-client";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Status = "checking" | "unsupported" | "not-configured" | "ready";

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("checking");
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (!publicKey) {
      setStatus("not-configured");
      return;
    }

    setPermission(Notification.permission);
    navigator.serviceWorker
      .getRegistration()
      .then(async (registration) => {
        const existing = await registration?.pushManager.getSubscription();
        setSubscribed(!!existing);
        setStatus("ready");
      })
      .catch(() => setStatus("ready"));
  }, [publicKey]);

  const enablePush = async () => {
    if (!publicKey) return;
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        toast({
          variant: "destructive",
          description:
            "You'll need to allow notifications in your browser to turn this on.",
        });
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await kyInstance.post("/api/push/subscribe", {
        json: subscription.toJSON(),
      });

      setSubscribed(true);
      toast({ description: "Push notifications turned on" });
    } catch (error) {
      console.error("Failed to enable push notifications", error);
      toast({
        variant: "destructive",
        description: "Couldn't turn on push notifications. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const disablePush = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await kyInstance.post("/api/push/unsubscribe", {
          json: { endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast({ description: "Push notifications turned off" });
    } catch (error) {
      console.error("Failed to disable push notifications", error);
      toast({
        variant: "destructive",
        description: "Couldn't turn off push notifications. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0d0d0d] pb-8">
      <PageBackHeader title="Notifications" />
      <div className="px-4 py-6">
        <div className="overflow-hidden rounded-xl bg-[#161616] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#A1C217]/15 text-[#A1C217]">
              <Bell className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">Push notifications</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Get notified on this device for likes, comments, teammate
                requests, messages, and updates about games near you -- even
                when PlayFinder isn&apos;t open.
              </p>

              {status === "checking" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Checking...
                </p>
              )}

              {status === "unsupported" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Your browser doesn&apos;t support push notifications.
                </p>
              )}

              {status === "not-configured" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Push notifications aren&apos;t set up on this deployment yet.
                </p>
              )}

              {status === "ready" && (
                <>
                  {permission === "denied" ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Notifications are blocked for PlayFinder in your browser
                      settings. Allow them there to turn this on.
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={subscribed ? disablePush : enablePush}
                      className={
                        subscribed
                          ? "mt-3 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#232323] disabled:opacity-60"
                          : "mt-3 rounded-full bg-[#A1C217] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#93b314] disabled:opacity-60"
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : subscribed ? (
                        "Turn off"
                      ) : (
                        "Turn on"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
