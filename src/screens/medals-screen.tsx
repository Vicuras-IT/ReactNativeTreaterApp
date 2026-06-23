import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignBackground, Icon, PillTabs, ProgressBar, Txt } from '@/components/ui';
import { useUser } from '@/state/user-context';
import { Alpha, Colors, Radius, Spacing } from '@/theme';

// ── Demo data ────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'earned' | 'locked';

interface Badge {
  name: string;
  icon: string;
  /** small caption under the name (e.g. requirement / date earned) */
  sub?: string;
  earned: boolean;
}

interface BadgeGroup {
  group: string;
  groupIcon: string;
  items: Badge[];
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'earned', label: 'Optjent' },
  { key: 'locked', label: 'Låste' },
];

const BADGE_GROUPS: BadgeGroup[] = [
  {
    group: 'Milepæle',
    groupIcon: 'flag',
    items: [
      { name: 'Første behandling', icon: 'spa', sub: 'Maj 2025', earned: true },
      { name: '10 behandlinger', icon: 'star', sub: 'Jun 2025', earned: true },
      { name: '100 behandlinger', icon: 'military_tech', sub: '62/100', earned: false },
      { name: '500 behandlinger', icon: 'workspace_premium', sub: '62/500', earned: false },
    ],
  },
  {
    group: 'Kvalitet',
    groupIcon: 'verified',
    items: [
      { name: 'Topvurdering', icon: 'grade', sub: '4,9 ★', earned: true },
      { name: 'Stjernebehandler', icon: 'auto_awesome', sub: '20 × 5 ★', earned: true },
      { name: 'Anbefalet', icon: 'thumb_up', sub: '15 anbef.', earned: false },
    ],
  },
  {
    group: 'Pålidelighed',
    groupIcon: 'schedule',
    items: [
      { name: 'Punktlig', icon: 'alarm_on', sub: '30 vagter', earned: true },
      { name: 'Aldrig afbud', icon: 'event_available', sub: 'Q1 2025', earned: true },
      { name: 'Tidlig fugl', icon: 'wb_sunny', sub: '10 morgener', earned: false },
    ],
  },
  {
    group: 'Samarbejde',
    groupIcon: 'groups',
    items: [
      { name: 'Holdspiller', icon: 'diversity_3', sub: 'Apr 2025', earned: true },
      { name: 'Mentor', icon: 'school', sub: '3 nye kolleger', earned: true },
      { name: 'Vagtdækker', icon: 'swap_horiz', sub: '5/10 vagter', earned: false },
    ],
  },
];

function firstName(fullName?: string | null): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return 'Lars';
  return trimmed.split(/\s+/)[0];
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function MedalsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const [filter, setFilter] = useState<FilterKey>('all');

  const name = firstName(profile?.fullName);

  const { earnedTotal, total, pct } = useMemo(() => {
    const all = BADGE_GROUPS.flatMap((g) => g.items);
    const earned = all.filter((b) => b.earned).length;
    return {
      earnedTotal: earned,
      total: all.length,
      pct: all.length === 0 ? 0 : Math.round((earned / all.length) * 100),
    };
  }, []);

  const groupsView = useMemo(
    () =>
      BADGE_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((b) =>
          filter === 'all' ? true : filter === 'earned' ? b.earned : !b.earned,
        ),
      })).filter((g) => g.items.length > 0),
    [filter],
  );

  return (
    <DesignBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow_back" size={20} color={Colors.text} />
        </Pressable>
        <Txt font="displayBold" size={19} color={Colors.text}>
          Mine medaljer
        </Txt>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {/* Hero med progress */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroBadge}>
              <Icon name="workspace_premium" size={30} color={Colors.pink} />
            </View>
            <View style={styles.heroText}>
              <Txt font="displayBold" size={18} color={Colors.text}>
                Godt gået, {name}!
              </Txt>
              <Txt font="regular" size={13} color={Colors.muted} style={styles.heroSub}>
                {earnedTotal} af {total} medaljer
              </Txt>
            </View>
            <Txt font="displayExtrabold" size={24} color={Colors.pink}>
              {pct}%
            </Txt>
          </View>
          <ProgressBar progress={pct / 100} style={styles.heroProgress} />
        </View>

        {/* Filter */}
        <PillTabs tabs={FILTERS} selected={filter} onSelect={setFilter} />

        {/* Badge groups */}
        {groupsView.map((g) => {
          const groupEarned = g.items.filter((b) => b.earned).length;
          return (
            <View key={g.group} style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitle}>
                  <Icon name={g.groupIcon} size={16} color={Colors.pink} />
                  <Txt
                    font="bold"
                    size={12}
                    color={Colors.muted}
                    tracking={1.9}
                    uppercase>
                    {g.group}
                  </Txt>
                </View>
                <View style={styles.countPill}>
                  <Txt font="bold" size={11} color={Colors.pink}>
                    {groupEarned}/{g.items.length}
                  </Txt>
                </View>
              </View>

              <View style={styles.grid}>
                {g.items.map((b) => (
                  <BadgeTile key={b.name} badge={b} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </DesignBackground>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BadgeTile({ badge }: { badge: Badge }) {
  const { earned } = badge;
  return (
    <View
      style={[styles.tile, earned ? styles.tileEarned : styles.tileLocked]}>
      <View style={[styles.ring, earned ? styles.ringEarned : styles.ringLocked]}>
        <Icon
          name={badge.icon}
          size={26}
          color={earned ? Colors.pink : Colors.faint}
        />
      </View>
      <Txt
        font="bold"
        size={11.5}
        align="center"
        lineHeight={14}
        color={earned ? Colors.text : Colors.muted}>
        {badge.name}
      </Txt>
      {badge.sub ? (
        <Txt font="regular" size={9.5} align="center" color={Colors.faint}>
          {badge.sub}
        </Txt>
      ) : null}
      {earned ? null : (
        <Icon name="lock" size={14} color={Colors.faint} style={styles.lock} />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: Alpha.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
    gap: Spacing.xl,
  },

  // Hero
  hero: {
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    backgroundColor: Alpha.pinkTint,
    borderWidth: 1.5,
    borderColor: Alpha.pinkBorder,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(217,74,230,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0 },
  heroSub: { marginTop: 4 },
  heroProgress: { marginTop: 14 },

  // Sections
  section: { gap: Spacing.md },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countPill: {
    backgroundColor: 'rgba(217,74,230,0.10)',
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  // Grid + tiles
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 0,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
  },
  tileEarned: {
    backgroundColor: Alpha.glassStrong,
    borderColor: Alpha.hairline,
  },
  tileLocked: {
    backgroundColor: Alpha.glass,
    borderColor: Alpha.divider,
    opacity: 0.7,
  },
  ring: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringEarned: { backgroundColor: 'rgba(217,74,230,0.14)' },
  ringLocked: { backgroundColor: 'rgba(255,255,255,0.05)' },
  lock: { position: 'absolute', top: 8, right: 8 },
});
