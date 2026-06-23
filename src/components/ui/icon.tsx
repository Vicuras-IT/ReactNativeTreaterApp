import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { Colors } from '@/theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * The design references Material Symbols (underscore names). @expo/vector-icons
 * ships the Material Icons set with hyphenated names; we convert and patch the
 * handful that don't have a 1:1 counterpart.
 */
const OVERRIDES: Record<string, MaterialIconName> = {
  clinical_notes: 'assignment',
  fact_check: 'fact-check',
  edit_note: 'edit-note',
  person_off: 'person-off',
  event_available: 'event-available',
  receipt_long: 'receipt-long',
  photo_camera: 'photo-camera',
  search_off: 'search-off',
  workspace_premium: 'workspace-premium',
  calendar_month: 'calendar-month',
  task_alt: 'task-alt',
  chevron_right: 'chevron-right',
  chevron_left: 'chevron-left',
  expand_more: 'expand-more',
  expand_less: 'expand-less',
  arrow_forward: 'arrow-forward',
  arrow_back: 'arrow-back',
  play_arrow: 'play-arrow',
  open_in_new: 'open-in-new',
  local_cafe: 'local-cafe',
  local_parking: 'local-parking',
  meeting_room: 'meeting-room',
  cl_quick: 'bolt',
  inventory_2: 'inventory-2',
  more_horiz: 'more-horiz',
  notifications_active: 'notifications-active',
  star_rate: 'star-rate',
  monetization_on: 'monetization-on',
  health_and_safety: 'health-and-safety',
  emoji_events: 'emoji-events',
  cleaning_services: 'cleaning-services',
  wifi: 'wifi',
};

function resolveName(name: string): MaterialIconName {
  if (name in OVERRIDES) return OVERRIDES[name];
  return name.replace(/_/g, '-') as MaterialIconName;
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ComponentProps<typeof MaterialIcons>['style'];
}

export function Icon({ name, size = 24, color = Colors.text, style }: IconProps) {
  return (
    <MaterialIcons name={resolveName(name)} size={size} color={color} style={style} />
  );
}
