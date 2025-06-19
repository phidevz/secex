"use client";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.user.getLatest.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}
