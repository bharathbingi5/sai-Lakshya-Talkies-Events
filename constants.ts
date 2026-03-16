import { Room, Addon } from './types';

// Static data that doesn't change
export const ADDONS: Addon[] = [
  { id: 'fog', name: 'Fog Effect', price: 300, description: 'Cinematic fog entry' },
  { id: 'balloons', name: 'Extra Balloon Decoration', price: 300, description: 'Premium balloons' },
  {
    id: 'candles',
    name: 'Candle Path Decoration',
    price: 300,
    description: 'Romantic candle path',
  },
  { id: 'photography', name: 'Photography', price: 600, description: 'Professional shoot' },
  { id: 'videography', name: 'Videography', price: 1000, description: 'Event coverage' },
];

export const TIME_SLOTS = [
  '10:00 AM - 01:00 PM',
  '01:30 PM - 04:30 PM',
  '05:00 PM - 08:00 PM',
  '08:30 PM - 11:30 PM',
];

export const GOOGLE_FORM_PAYMENT_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLScH0jiZFr_hVkdlgZBZ4zvZpyztY2LufV4z2kAbkwSvYFtSJw/viewform?usp=publish-editor';

// For backward compatibility
export const ROOMS: Room[] = [];
