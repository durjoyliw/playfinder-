import type { ComponentType } from 'react';
import {
  Activity, CircleDot, Dumbbell, Shield, Trophy, Zap,
} from 'lucide-react';

export type Sport = 'All' | 'Basketball' | 'Football' | 'Gym' | 'Polo' | 'Tennis';

export type SportIcon = ComponentType<{ size?: number | string; className?: string }>;

export const SPORT_ICONS: Record<Sport, SportIcon> = {
  All: Zap,
  Basketball: CircleDot,
  Football: Shield,
  Gym: Dumbbell,
  Polo: Trophy,
  Tennis: Activity,
};

export const SPORT_EMOJI: Record<string, string> = {
  Basketball: '🏀',
  Football: '⚽',
  Gym: '🏋️',
  Polo: '🐎',
  Tennis: '🎾',
  Running: '🏃',
};

export const SPORT_COLOURS: Record<string, string> = {
  Basketball: '#ff8a4c',
  Football: '#4ee0a0',
  Gym: '#ff6b6b',
  Polo: '#b08aff',
  Tennis: '#dcef5a',
  Running: '#56ccf2',
};

export type Status = 'looking' | 'team' | 'coach' | 'recruiting' | 'break';

export const STATUS_INFO: Record<Status, { label: string; colour: string; emoji: string }> = {
  looking:    { label: 'Looking to Play',      colour: '#c9f31d', emoji: '🟢' },
  team:       { label: 'Join a Team',          colour: '#56ccf2', emoji: '🔵' },
  coach:      { label: 'Available to Coach',   colour: '#ff8a4c', emoji: '🟠' },
  recruiting: { label: 'Looking for Players',  colour: '#b08aff', emoji: '🟣' },
  break:      { label: 'Taking a Break',       colour: '#8a8f87', emoji: '⚫' },
};

export type Skill = 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';

export interface SocialPost {
  id: string;
  author: Author;
  sport: Sport;
  text: string;
  timestamp: string;
  city: string;
  likes: number;
  comments: number;
  liked?: boolean;
  image?: string;
}

export interface ArenaPost {
  id: string;
  author: Author;
  sport: Sport;
  title: string;
  description: string;
  schedule: string;
  timeLabel: string;
  location: string;
  spotsTotal: number;
  spotsFilled: number;
  timestamp: string;
  participants: { initials: string; colour: string }[];
}

export interface Author {
  name: string;
  handle: string;
  initials: string;
  avatarColour: string;
  city: string;
  status: Status;
  verified?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  distance: string;
  sport: Sport;
  bookable: boolean;
  rating: number;
  image: string;
  mapPos: { x: number; y: number };
}

export interface Player {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarColour: string;
  city: string;
  postcode: string;
  status: Status;
  sports: { sport: string; level: Skill }[];
  joinDate: string;
  bio: string;
  stats: { games: number; broadcasts: number; teammates: number };
  coverImage?: string;
  isMe?: boolean;
  verified?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarColour: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export const CURRENT_USER: Player = {
  id: 'me',
  name: 'Durjoy Roy',
  handle: '@durjoy',
  initials: 'DR',
  avatarColour: '#c9f31d',
  city: 'Glasgow',
  postcode: 'G42 8RT',
  status: 'looking',
  sports: [
    { sport: 'Football', level: 'Pro' },
    { sport: 'Basketball', level: 'Advanced' },
    { sport: 'Gym', level: 'Advanced' },
    { sport: 'Tennis', level: 'Intermediate' },
    { sport: 'Running', level: 'Intermediate' },
  ],
  joinDate: 'May 2026',
  bio: 'Always up for a game, a new challenge, or a coffee after. I play hard, keep it friendly, and believe the best teams start with good people.',
  stats: { games: 12, broadcasts: 8, teammates: 24 },
  coverImage: 'https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&h=400&w=940',
  isMe: true,
};

export const OTHER_PLAYERS: Player[] = [
  {
    id: 'p1', name: 'Jamie McCall', handle: '@jamiemccall', initials: 'JM',
    avatarColour: '#56ccf2', city: 'Glasgow', postcode: 'G3 6QD',
    status: 'looking',
    sports: [{ sport: 'Football', level: 'Advanced' }, { sport: 'Gym', level: 'Intermediate' }],
    joinDate: 'Jan 2026', bio: 'Weekend warrior. Part-time striker.',
    stats: { games: 18, broadcasts: 5, teammates: 31 },
  },
  {
    id: 'p2', name: 'Aisha Rahman', handle: '@aishar', initials: 'AR',
    avatarColour: '#b08aff', city: 'Glasgow', postcode: 'G12 8QQ',
    status: 'team',
    sports: [{ sport: 'Tennis', level: 'Advanced' }, { sport: 'Basketball', level: 'Intermediate' }],
    joinDate: 'Mar 2026', bio: 'Tennis coach by day, baller by night.',
    stats: { games: 22, broadcasts: 12, teammates: 45 },
  },
  {
    id: 'p3', name: 'Ross Davidson', handle: '@rossd', initials: 'RD',
    avatarColour: '#ff8a4c', city: 'Glasgow', postcode: 'G41 3DX',
    status: 'coach',
    sports: [{ sport: 'Football', level: 'Pro' }, { sport: 'Running', level: 'Advanced' }],
    joinDate: 'Nov 2025', bio: 'FA Level 2 coach. I help you get better.',
    stats: { games: 34, broadcasts: 15, teammates: 52 },
    verified: true,
  },
];

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 's1',
    author: { name: 'Jordan Vance', handle: '@jordanv', initials: 'JV', avatarColour: '#4ee0a0', city: 'Glasgow', status: 'looking' },
    sport: 'Basketball', city: 'Glasgow',
    text: "PSA: the outdoor courts at Kelvingrove are free, usually quiet before 11am on weekends, and the surface is actually decent. Stop paying for indoor courts when you're just doing drills.",
    timestamp: '2h', likes: 24, comments: 6,
    image: 'https://images.pexels.com/photos/12700811/pexels-photo-12700811.jpeg?auto=compress&cs=tinysrgb&h=400&w=940',
  },
  {
    id: 's2',
    author: { name: 'Ross Davidson', handle: '@rossd', initials: 'RD', avatarColour: '#ff8a4c', city: 'Glasgow', status: 'coach', verified: true },
    sport: 'Football', city: 'Glasgow',
    text: "Glasgow weather really said you wanted to go for a run? Here's horizontal rain and 40mph wind. Enjoy. Treadmill szn it is.",
    timestamp: '5h', likes: 47, comments: 12,
  },
  {
    id: 's3',
    author: { name: 'Sarah Kennedy', handle: '@sarahk', initials: 'SK', avatarColour: '#dcef5a', city: 'Glasgow', status: 'team' },
    sport: 'Gym', city: 'Glasgow',
    text: "Unpopular opinion: most people in the gym don't need a PT, they need a plan and a little consistency.",
    timestamp: '8h', likes: 89, comments: 24,
    image: 'https://images.pexels.com/photos/4720758/pexels-photo-4720758.jpeg?auto=compress&cs=tinysrgb&h=400&w=940',
  },
  {
    id: 's4',
    author: { name: 'Aisha Rahman', handle: '@aishar', initials: 'AR', avatarColour: '#b08aff', city: 'Glasgow', status: 'team' },
    sport: 'Tennis', city: 'Glasgow',
    text: "Just played the best rally of my life at Scotstoun. 45 minutes of pure flow. This is why we play.",
    timestamp: '1d', likes: 31, comments: 4,
  },
];

export const ARENA_POSTS: ArenaPost[] = [
  {
    id: 'a1',
    author: { name: 'Sarah Kennedy', handle: '@sarahk', initials: 'SK', avatarColour: '#dcef5a', city: 'Glasgow', status: 'recruiting' },
    sport: 'Tennis', title: 'UWS Tennis Club — Open Session',
    description: 'Beginners welcome. We\'re building a friendly group for regular games and a bit of healthy competition.',
    schedule: 'Tues & Thurs', timeLabel: '18:00', location: 'UWS Campus',
    spotsTotal: 4, spotsFilled: 2, timestamp: '3h',
    participants: [{ initials: 'SK', colour: '#dcef5a' }, { initials: 'JM', colour: '#56ccf2' }],
  },
  {
    id: 'a2',
    author: { name: 'Elite FC', handle: '@elitefc', initials: 'EF', avatarColour: '#4ee0a0', city: 'Glasgow', status: 'recruiting', verified: true },
    sport: 'Football', title: 'Centre Back Wanted — Summer League',
    description: 'Solid Sunday side looking for one more player. Two training sessions a week and a great bunch.',
    schedule: 'Saturday League', timeLabel: '15:00', location: 'Scotland Street',
    spotsTotal: 1, spotsFilled: 0, timestamp: '6h',
    participants: [],
  },
  {
    id: 'a3',
    author: { name: 'Durojoy Liv', handle: '@duroliv', initials: 'DL', avatarColour: '#ff8a4c', city: 'Glasgow', status: 'looking' },
    sport: 'Football', title: 'Casual 5-a-side — Need 3 More',
    description: 'All levels welcome, just bring the energy. Quick game, then food after.',
    schedule: 'Tonight', timeLabel: '19:00', location: 'Powerleague Townhead',
    spotsTotal: 5, spotsFilled: 2, timestamp: '1h',
    participants: [{ initials: 'DL', colour: '#ff8a4c' }, { initials: 'AR', colour: '#b08aff' }],
  },
  {
    id: 'a4',
    author: { name: 'Mark Boyle', handle: '@markb', initials: 'MB', avatarColour: '#56ccf2', city: 'Glasgow', status: 'recruiting' },
    sport: 'Basketball', title: 'Pickup Run — Need 4',
    description: 'Competitive but friendly. Outdoor court, good surface.',
    schedule: 'Tomorrow', timeLabel: '17:00', location: 'Kelvingrove Park',
    spotsTotal: 4, spotsFilled: 0, timestamp: '20m',
    participants: [],
  },
];

export const VENUES: Venue[] = [
  { id: 'v1', name: 'Powerleague Glasgow Townhead', address: 'McPhater St, Glasgow G4 0HW', distance: '0.5 mi', sport: 'Football', bookable: true, rating: 5, image: 'https://images.pexels.com/photos/47343/the-ball-stadion-horn-corner-47343.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 52, y: 40 } },
  { id: 'v2', name: 'Kelvingrove Park Courts', address: 'Kelvingrove, Glasgow G3', distance: '0.8 mi', sport: 'Basketball', bookable: false, rating: 4, image: 'https://images.pexels.com/photos/12700811/pexels-photo-12700811.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 28, y: 56 } },
  { id: 'v3', name: 'UWS Sports Centre', address: 'Paisley Rd, Glasgow G5', distance: '1.4 mi', sport: 'Tennis', bookable: true, rating: 5, image: 'https://images.pexels.com/photos/13441232/pexels-photo-13441232.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 68, y: 70 } },
  { id: 'v4', name: 'Pure Gym City Centre', address: 'Trongate, Glasgow G1', distance: '1.2 mi', sport: 'Gym', bookable: true, rating: 4, image: 'https://images.pexels.com/photos/4720758/pexels-photo-4720758.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 46, y: 50 } },
  { id: 'v5', name: 'Toryglen Football Centre', address: 'Toryglen, Glasgow G42', distance: '2.8 mi', sport: 'Football', bookable: true, rating: 5, image: 'https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 60, y: 78 } },
  { id: 'v6', name: 'Scotstoun Stadium', address: 'Scotstoun, Glasgow G14', distance: '3.5 mi', sport: 'Football', bookable: false, rating: 4, image: 'https://images.pexels.com/photos/33210166/pexels-photo-33210166.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 20, y: 30 } },
  { id: 'v7', name: 'Goals Glasgow South', address: 'Scotland St, Glasgow G5', distance: '1.0 mi', sport: 'Football', bookable: true, rating: 4, image: 'https://images.pexels.com/photos/47343/the-ball-stadion-horn-corner-47343.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 50, y: 62 } },
  { id: 'v8', name: 'Glasgow Green Pitches', address: 'Glasgow Green, G1', distance: '0.3 mi', sport: 'Football', bookable: false, rating: 3, image: 'https://images.pexels.com/photos/33210166/pexels-photo-33210166.jpeg?auto=compress&cs=tinysrgb&h=300&w=500', mapPos: { x: 58, y: 55 } },
];

export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', name: 'Jamie McCall', handle: '@jamiemccall', initials: 'JM', avatarColour: '#56ccf2', lastMessage: 'See you at Powerleague at 7?', timestamp: '5m', unread: 2, online: true },
  { id: 'c2', name: 'Sarah Kennedy', handle: '@sarahk', initials: 'SK', avatarColour: '#dcef5a', lastMessage: 'Tennis session is confirmed for Thursday', timestamp: '1h', unread: 0, online: true },
  { id: 'c3', name: 'Elite FC', handle: '@elitefc', initials: 'EF', avatarColour: '#4ee0a0', lastMessage: 'Can you make training on Saturday?', timestamp: '3h', unread: 1, online: false },
  { id: 'c4', name: 'Aisha Rahman', handle: '@aishar', initials: 'AR', avatarColour: '#b08aff', lastMessage: 'That rally was insane lol', timestamp: '1d', unread: 0, online: false },
];

export const SPORTS_LIST: Sport[] = ['All', 'Basketball', 'Football', 'Gym', 'Polo', 'Tennis'];
