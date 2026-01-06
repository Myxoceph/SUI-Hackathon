import {
  Terminal,
  User,
  Plus,
  Globe,
  Trophy,
  Settings as SettingsIcon,
  MessageSquare,
  Briefcase,
  Users,
} from 'lucide-react'

export const NAV_ITEMS = [
  { path: '/', label: 'HOME', icon: Terminal },
  { path: '/passport', label: 'PASSPORT', icon: User },
  { path: '/contribute', label: 'CONTRIBUTE', icon: Plus },
  { path: '/explore', label: 'EXPLORE', icon: Globe },
  { path: '/jobs', label: 'JOBS', icon: Briefcase },
  { path: '/community', label: 'COMMUNITY', icon: Users },
  { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { path: '/messages', label: 'MESSAGES', icon: MessageSquare },
  { path: '/settings', label: 'SETTINGS', icon: SettingsIcon },
]

export const APP_NAME = 'PeerFlow'
export const APP_VERSION = 'v0.1.0-alpha'
