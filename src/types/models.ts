export type Energy = 'low' | 'mid' | 'high'

export type CrowdTag = 'dancefloor_killer' | 'bridge_track'

export type Track = {
  id: string
  title: string
  artist: string
  bpm: number
  key: string
  energy: Energy
  cueIn: string
  cueOut: string
  danceability: number
  spotifyEnergy: number
  acousticness: number
  label: string
  year: number
  coverSeed: string
  previewUrl?: string
  spotifyOpenUrl?: string
}

export type Setlist = {
  id: string
  title: string
  dj: string
  bpmRange: string
  score: number
  tracks: Track[]
}

export type Comment = {
  id: string
  author: string
  body: string
}

export type ThreadReply = {
  id: string
  author: string
  body: string
}

export type ThreadComment = Comment & {
  replies?: ThreadReply[]
}

export type NotificationItem = {
  id: string
  kind: 'crate_save' | 'comment' | 'mention'
  title: string
  detail: string
  time: string
  read: boolean
}

export type ActivityItem = {
  id: string
  kind: string
  text: string
  time: string
}
