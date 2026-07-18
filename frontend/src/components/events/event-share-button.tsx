"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type EventShareButtonProps = {
  title: string;
  url: string;
};

export function EventShareButton({ title, url }: EventShareButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("Link copied to clipboard");
    } catch {
      setMessage("Unable to share this event");
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="soft" onClick={handleShare}>
        <Share2 aria-hidden />
        Share event
      </Button>
      {message ? (
        <p className="text-caption text-muted-foreground" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}
