import {
  activityFeedSeed,
  communitySets,
  discoveryTracks,
  notificationsSeed,
} from "../data/seed";
import type {
  ActivityItem,
  NotificationItem,
  Setlist,
  Track,
} from "../types/models";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchCommunitySets(): Promise<Setlist[]> {
  await wait(120);
  return communitySets;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await wait(90);
  return notificationsSeed;
}

export async function fetchActivityFeed(): Promise<ActivityItem[]> {
  await wait(90);
  return activityFeedSeed;
}

export async function searchDiscoveryTracks(query: string): Promise<Track[]> {
  await wait(100);
  const q = query.trim().toLowerCase();
  if (q.length === 0) return discoveryTracks;
  return discoveryTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q),
  );
}
