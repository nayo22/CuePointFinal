import type {
  ActivityItem,
  Comment,
  CrowdTag,
  NotificationItem,
  Setlist,
  ThreadComment,
  Track,
} from '../types/models'

export const CURRENT_USER = 'You (Editor)'

export const DRAFT_ID = 'draft-1'

export const INITIAL_DRAFT_TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Parallel Lines',
    artist: 'Nøva',
    bpm: 124,
    key: '8A',
    energy: 'low',
    cueIn: 'Bar 33, skip intro FX',
    cueOut: 'Outro 16 bars, bring low end',
    danceability: 0.72,
    spotifyEnergy: 0.58,
    acousticness: 0.12,
    label: 'Midnight Shift',
    year: 2023,
    coverSeed: 'cp-t1',
  },
  {
    id: 't2',
    title: 'Glass Floor',
    artist: 'Kite Loop',
    bpm: 126,
    key: '9A',
    energy: 'mid',
    cueIn: 'Drop on downbeat after break',
    cueOut: 'Loop last 8 before vocal',
    danceability: 0.81,
    spotifyEnergy: 0.74,
    acousticness: 0.04,
    label: 'Analogue Attic',
    year: 2022,
    coverSeed: 'cp-t2',
  },
  {
    id: 't3',
    title: 'Red Vector',
    artist: 'Mode East',
    bpm: 128,
    key: '10A',
    energy: 'high',
    cueIn: 'Mix from low-pass sweep',
    cueOut: 'Hard cut at breakdown',
    danceability: 0.88,
    spotifyEnergy: 0.91,
    acousticness: 0.02,
    label: 'Drumcode',
    year: 2024,
    coverSeed: 'cp-t3',
  },
]

export const communitySets: Setlist[] = [
  {
    id: 'set-aurora',
    title: 'Aurora Peak',
    dj: 'DJ Mira',
    bpmRange: '126–132',
    score: 94,
    tracks: [
      {
        id: 'c1',
        title: 'Ion Trail',
        artist: 'Silt',
        bpm: 126,
        key: '8A',
        energy: 'low',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.7,
        spotifyEnergy: 0.55,
        acousticness: 0.08,
        label: 'Non Series',
        year: 2021,
        coverSeed: 'cp-c1',
      },
      {
        id: 'c2',
        title: 'Steel Garden',
        artist: 'Helix Unit',
        bpm: 128,
        key: '9A',
        energy: 'high',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.86,
        spotifyEnergy: 0.89,
        acousticness: 0.03,
        label: 'Blueprint',
        year: 2023,
        coverSeed: 'cp-c2',
      },
    ],
  },
  {
    id: 'set-basement',
    title: 'Basement Pressure',
    dj: 'Leo K',
    bpmRange: '130–135',
    score: 88,
    tracks: [
      {
        id: 'b1',
        title: 'Ridge Run',
        artist: 'Tension',
        bpm: 130,
        key: '11A',
        energy: 'mid',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.79,
        spotifyEnergy: 0.8,
        acousticness: 0.05,
        label: 'Mote Evolver',
        year: 2020,
        coverSeed: 'cp-b1',
      },
    ],
  },
  {
    id: 'set-velocity',
    title: 'Velocity Curve',
    dj: 'Nina Flux',
    bpmRange: '128–134',
    score: 91,
    tracks: [
      {
        id: 'v1',
        title: 'Copper Wire',
        artist: 'Dry Signal',
        bpm: 128,
        key: '10A',
        energy: 'mid',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.77,
        spotifyEnergy: 0.72,
        acousticness: 0.06,
        label: 'Kompakt',
        year: 2019,
        coverSeed: 'cp-v1',
      },
      {
        id: 'v2',
        title: 'Night Freight',
        artist: 'Cargo',
        bpm: 132,
        key: '11A',
        energy: 'high',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.84,
        spotifyEnergy: 0.88,
        acousticness: 0.02,
        label: 'Ostgut Ton',
        year: 2022,
        coverSeed: 'cp-v2',
      },
    ],
  },
  {
    id: 'set-lattice',
    title: 'Lattice Logic',
    dj: 'ARK-19',
    bpmRange: '122–126',
    score: 86,
    tracks: [
      {
        id: 'l1',
        title: 'Soft Grid',
        artist: 'Paper Room',
        bpm: 122,
        key: '7A',
        energy: 'low',
        cueIn: '—',
        cueOut: '—',
        danceability: 0.68,
        spotifyEnergy: 0.42,
        acousticness: 0.22,
        label: 'Smallville',
        year: 2021,
        coverSeed: 'cp-l1',
      },
    ],
  },
]

export const discoveryTracks: Track[] = [
  {
    id: 'd1',
    title: 'Mirror Stage',
    artist: 'Phase Theory',
    bpm: 127,
    key: '9A',
    energy: 'mid',
    cueIn: '',
    cueOut: '',
    danceability: 0.83,
    spotifyEnergy: 0.76,
    acousticness: 0.04,
    label: 'Token',
    year: 2024,
    coverSeed: 'cp-d1',
  },
  {
    id: 'd2',
    title: 'Low Orbit',
    artist: 'Sable',
    bpm: 125,
    key: '8A',
    energy: 'low',
    cueIn: '',
    cueOut: '',
    danceability: 0.74,
    spotifyEnergy: 0.51,
    acousticness: 0.14,
    label: 'LNOE',
    year: 2023,
    coverSeed: 'cp-d2',
  },
  {
    id: 'd3',
    title: 'Acid Ledger',
    artist: 'Mint Line',
    bpm: 129,
    key: '10A',
    energy: 'high',
    cueIn: '',
    cueOut: '',
    danceability: 0.9,
    spotifyEnergy: 0.93,
    acousticness: 0.01,
    label: 'Stay Up Forever',
    year: 1999,
    coverSeed: 'cp-d3',
  },
  {
    id: 'd4',
    title: 'Velvet Lock',
    artist: 'Harbor',
    bpm: 124,
    key: '8B',
    energy: 'mid',
    cueIn: '',
    cueOut: '',
    danceability: 0.8,
    spotifyEnergy: 0.63,
    acousticness: 0.09,
    label: 'Running Back',
    year: 2022,
    coverSeed: 'cp-d4',
  },
]

export const setComments: Record<string, Comment[]> = {
  'set-aurora': [
    {
      id: 'cm1',
      author: 'Leo K',
      body: 'Transition from track 1 to 2 is phrase-perfect — same energy pocket.',
    },
    {
      id: 'cm2',
      author: 'DJ Mira',
      body: 'I’d shorten the breakdown on track 2 by 8 bars for peak-time rooms.',
    },
  ],
  'set-basement': [
    {
      id: 'cm3',
      author: 'You (Editor)',
      body: 'Kick stacking is clean; would try -1 dB on the low mids in the first drop.',
    },
  ],
}

export const perTrackThreads: Record<string, Record<string, ThreadComment[]>> = {
  'set-aurora': {
    c1: [
      {
        id: 'tc1',
        author: 'Leo K',
        body: 'Entry on the offbeat hat works — I’d pull low shelf -0.5 dB on the kick.',
        replies: [
          {
            id: 'tr1',
            author: 'DJ Mira',
            body: 'Agreed; tried that in the booth last week and it sat cleaner.',
          },
        ],
      },
    ],
    c2: [
      {
        id: 'tc2',
        author: 'Nina Flux',
        body: 'That transition from track 1 → 2 is in perfect phrasing.',
        replies: [],
      },
    ],
  },
  'set-basement': {
    b1: [
      {
        id: 'tc3',
        author: 'ARK-19',
        body: 'Bridge track energy is ideal before the second peak.',
        replies: [
          {
            id: 'tr2',
            author: 'Leo K',
            body: '+1 — crowd didn’t dip on this one.',
          },
        ],
      },
    ],
  },
}

export const crowdTagByTrackId: Record<string, CrowdTag | null> = {
  t2: 'bridge_track',
  t3: 'dancefloor_killer',
  c2: 'dancefloor_killer',
  c1: 'bridge_track',
  b1: 'dancefloor_killer',
  v2: 'dancefloor_killer',
  d1: null,
  d3: 'dancefloor_killer',
}

export const alsoInCratesByTrackId: Record<string, string[]> = {
  t1: ['DJ Mira', 'Leo K'],
  c2: ['Nina Flux', 'You (Editor)', 'ARK-19'],
  t2: ['DJ Mira'],
}

export const notificationsSeed: NotificationItem[] = [
  {
    id: 'n1',
    kind: 'crate_save',
    title: 'Crate save',
    detail: 'DJ Mira saved “Parallel Lines” to their Smart Crate.',
    time: '2m ago',
    read: false,
  },
  {
    id: 'n2',
    kind: 'comment',
    title: 'New technical comment',
    detail: 'Leo K commented on “Aurora Peak” (track 2).',
    time: '18m ago',
    read: false,
  },
  {
    id: 'n3',
    kind: 'mention',
    title: 'Mention',
    detail: 'Nina Flux mentioned you in a thread on “Velocity Curve”.',
    time: '1h ago',
    read: true,
  },
]

export const activityFeedSeed: ActivityItem[] = [
  {
    id: 'a1',
    kind: 'comment',
    text: 'Leo K left technical feedback on Aurora Peak.',
    time: '18m ago',
  },
  {
    id: 'a2',
    kind: 'crate',
    text: 'DJ Mira added one of your tracks to a crate.',
    time: '2m ago',
  },
  {
    id: 'a3',
    kind: 'rank',
    text: 'Velocity Curve moved up #3 in weekly structure ranking.',
    time: '3h ago',
  },
]

export function buildDraftSetlist(tracks: Track[]): Setlist {
  return {
    id: DRAFT_ID,
    title: 'Friday Warm-Up',
    dj: CURRENT_USER,
    bpmRange: '124–128',
    score: 0,
    tracks,
  }
}

export function resolveSet(
  id: string | undefined,
  draftTracks: Track[],
): Setlist | undefined {
  if (!id) return undefined
  if (id === DRAFT_ID) return buildDraftSetlist(draftTracks)
  return communitySets.find((s) => s.id === id)
}

export function allTracksForCrate(draftTracks: Track[]): Track[] {
  const rows = [...draftTracks]
  for (const s of communitySets) rows.push(...s.tracks)
  for (const t of discoveryTracks) {
    if (!rows.some((r) => r.id === t.id)) rows.push(t)
  }
  return rows
}
