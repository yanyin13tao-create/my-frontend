import { Flag, MessageSquareWarning, Pizza } from 'lucide-react';

export const categories = {
  all: { label: 'All Entries' },
  ghosted: { label: 'Ghosted', icon: MessageSquareWarning },
  redFlag: { label: 'Massive Red Flags', icon: Flag },
  flaked: { label: 'Promised & Flaked', icon: Pizza },
};

export const fallbackEntries = [
  {
    id: 1,
    type: 'system',
    category: 'ghosted',
    displayTime: '2 hours ago',
    author: 'Anonymous Victim',
    count: 42,
    story:
      'Swore up and down they wanted to grab coffee this weekend, locked in the exact time and place... then unadded me on everything 30 minutes before arrival. Classic.',
  },
  {
    id: 2,
    type: 'system',
    category: 'redFlag',
    displayTime: 'Yesterday',
    author: 'DevSurvivor',
    count: 89,
    story:
      'Talked for 3 weeks about building a joint project together. Turned out they just wanted me to debug their entire codebase for free and vanished.',
  },
  {
    id: 3,
    type: 'system',
    category: 'flaked',
    displayTime: '3 days ago',
    author: 'Timeless Wanderer',
    count: 124,
    story:
      "Said 'let me check my schedule' and I am still waiting in the void of space-time continuum.",
  },
];
