import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  HeaderIconButton,
  Icon,
  PillTabs,
  Txt,
  useToast,
} from '@/components/ui';
import { useNav } from '@/state/navigation-context';
import { useUser } from '@/state/user-context';
import { Alpha, Colors, Radius, Spacing } from '@/theme';

type ForumTab = 'chat' | 'support' | 'bytteboers';

const TABS: { key: ForumTab; label: string }[] = [
  { key: 'chat', label: 'Chat' },
  { key: 'support', label: 'Support' },
  { key: 'bytteboers', label: 'Byttebørs' },
];

interface Conversation {
  id: string;
  title: string;
  preview: string;
  time: string;
  /** Material symbol — when set, renders an icon tile instead of an avatar. */
  icon?: string;
  iconColor?: string;
  iconTint?: string;
  iconBorder?: string;
  /** Avatar initials — used when no icon is supplied. */
  initials?: string;
  pictureBase64?: string | null;
  unread?: number;
  online?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'team-nord',
    title: 'Team Nord',
    preview: 'Maja: Husk frokostmødet på fredag 🙌',
    time: '09:24',
    icon: 'groups',
    iconColor: Colors.lilac,
    unread: 3,
  },
  {
    id: 'sofie-larsen',
    title: 'Sofie Larsen',
    preview: 'Tak for i går — kan du tage min vagt?',
    time: '08:10',
    initials: 'SL',
    unread: 1,
    online: true,
  },
  {
    id: 'mads-holm',
    title: 'Mads Holm',
    preview: 'Du: Jeg er på klinikken kl. 14 👍',
    time: 'I går',
    initials: 'MH',
    online: true,
  },
  {
    id: 'team-syd',
    title: 'Team Syd',
    preview: 'Anders: Ny vejledning er lagt op',
    time: 'Man',
    icon: 'groups',
    iconColor: Colors.lilac,
  },
  {
    id: 'emma-vinter',
    title: 'Emma Vinter',
    preview: 'Vi ses til kurset på torsdag!',
    time: '12. jun',
    initials: 'EV',
  },
];

interface SupportTopic {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'loen',
    icon: 'payments',
    title: 'Løn & udbetaling',
    desc: 'Spørgsmål om din lønseddel eller udbetaling',
  },
  {
    id: 'vagter',
    icon: 'event_available',
    title: 'Vagter & planlægning',
    desc: 'Ændringer, sygemelding og ferieønsker',
  },
  {
    id: 'udstyr',
    icon: 'inventory_2',
    title: 'Udstyr & materialer',
    desc: 'Bestilling, fejl og mangler',
  },
  {
    id: 'teknik',
    icon: 'help',
    title: 'Teknisk support',
    desc: 'Problemer med app eller login',
  },
];

interface Swap {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  tagBorder: string;
  barColor: string;
  title: string;
  icon: string;
  dur: string;
  loc: string;
}

const SWAPS: Swap[] = [
  {
    id: 'swap-1',
    tag: 'Søger bytte',
    tagColor: Colors.pink,
    tagBg: Alpha.pinkTint,
    tagBorder: Alpha.pinkBorder,
    barColor: Colors.pink,
    title: 'Aftenvagt — fre. 27. jun',
    icon: 'nightlight',
    dur: '16:00 – 21:00',
    loc: 'Klinik Nord',
  },
  {
    id: 'swap-2',
    tag: 'Tilbyder',
    tagColor: Colors.success,
    tagBg: Alpha.successTint,
    tagBorder: Alpha.successBorder,
    barColor: Colors.success,
    title: 'Dagvagt — man. 30. jun',
    icon: 'light_mode',
    dur: '08:00 – 14:00',
    loc: 'Klinik Syd',
  },
];

export function ForumScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNav();
  const toast = useToast();
  const { profile } = useUser();
  const [tab, setTab] = useState<ForumTab>('chat');

  const initials = profile?.initials ?? 'LH';
  const openConversation = () => toast.show('Åbner samtale');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Txt font="displayExtrabold" size={22} color={Colors.pink}>
          Forum
        </Txt>
        <View style={styles.headerActions}>
          <HeaderIconButton
            icon="notifications"
            onPress={nav.openNotifications}
          />
          <Pressable
            onPress={() => nav.setTab('profile')}
            style={({ pressed }) => pressed && styles.pressed}>
            <Avatar
              initials={initials}
              pictureBase64={profile?.pictureBase64}
              size={36}
              fontSize={12}
            />
          </Pressable>
        </View>
      </View>

      {/* Sub-tabs */}
      <PillTabs<ForumTab>
        tabs={TABS}
        selected={tab}
        onSelect={setTab}
        style={styles.tabs}
      />

      {tab === 'chat' ? (
        <ChatTab onOpen={openConversation} />
      ) : tab === 'support' ? (
        <SupportTab onOpen={openConversation} />
      ) : (
        <BytteboersTab onOpen={openConversation} />
      )}
    </ScrollView>
  );
}

/* ------------------------------- Chat tab ------------------------------- */

function ChatTab({ onOpen }: { onOpen: () => void }) {
  return (
    <View style={styles.section}>
      {/* Highlighted AI assistant row — Vica */}
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.vicaRow, pressed && styles.pressed]}>
        <View style={styles.vicaTile}>
          <Icon name="smart_toy" size={28} color={Colors.success} />
        </View>
        <View style={styles.rowBody}>
          <View style={styles.titleRow}>
            <Txt font="bold" size={15} color={Colors.text}>
              Vica
            </Txt>
            <View style={styles.aiBadge}>
              <Txt font="bold" size={9} color={Colors.success} tracking={0.7} uppercase>
                AI
              </Txt>
            </View>
          </View>
          <Txt font="semibold" size={12.5} color={Colors.success} style={styles.vicaStatus}>
            Svarer med det samme
          </Txt>
        </View>
        <Icon name="edit_square" size={22} color={Colors.success} />
      </Pressable>

      {/* Aktive samtaler */}
      <View>
        <View style={styles.sectionHeading}>
          <View style={styles.greenDot} />
          <Txt font="displayBold" size={14} color={Colors.text}>
            Aktive samtaler
          </Txt>
        </View>
        <View style={styles.list}>
          {CONVERSATIONS.map((c) => (
            <ConversationRow key={c.id} conversation={c} onPress={onOpen} />
          ))}
        </View>
      </View>
    </View>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const c = conversation;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.convoRow, pressed && styles.pressed]}>
      <View style={styles.avatarWrap}>
        {c.icon ? (
          <View
            style={[
              styles.iconTile,
              c.iconTint ? { backgroundColor: c.iconTint } : null,
              c.iconBorder ? { borderColor: c.iconBorder } : null,
            ]}>
            <Icon name={c.icon} size={24} color={c.iconColor ?? Colors.lilac} />
          </View>
        ) : (
          <Avatar
            initials={c.initials ?? '?'}
            pictureBase64={c.pictureBase64}
            size={48}
            fontSize={16}
          />
        )}
        {c.online ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.rowBody}>
        <Txt font="bold" size={14.5} color={Colors.text} numberOfLines={1}>
          {c.title}
        </Txt>
        {c.icon === 'groups' ? (
          <View style={styles.metaRow}>
            <Icon name="group" size={13} color={Colors.faint} />
            <Txt font="medium" size={11} color={Colors.faint}>
              8 medlemmer
            </Txt>
          </View>
        ) : null}
        <Txt
          font="regular"
          size={12}
          color={Colors.muted}
          numberOfLines={1}
          style={styles.preview}>
          {c.preview}
        </Txt>
      </View>

      <View style={styles.rowTrailing}>
        <Txt font="medium" size={10} color={Colors.faint}>
          {c.time}
        </Txt>
        {c.unread ? (
          <View style={styles.unreadBadge}>
            <Txt font="bold" size={10} color={Colors.white}>
              {c.unread}
            </Txt>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------ Support tab ----------------------------- */

function SupportTab({ onOpen }: { onOpen: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Icon name="support_agent" size={16} color={Colors.pink} />
        <Txt font="displayBold" size={14} color={Colors.text}>
          Hvad kan vi hjælpe med?
        </Txt>
      </View>
      <View style={styles.list}>
        {SUPPORT_TOPICS.map((t) => (
          <Pressable
            key={t.id}
            onPress={onOpen}
            style={({ pressed }) => [styles.convoRow, pressed && styles.pressed]}>
            <View style={styles.iconTile}>
              <Icon name={t.icon} size={24} color={Colors.lilac} />
            </View>
            <View style={styles.rowBody}>
              <Txt font="bold" size={14.5} color={Colors.text}>
                {t.title}
              </Txt>
              <Txt
                font="regular"
                size={12}
                color={Colors.muted}
                style={styles.preview}>
                {t.desc}
              </Txt>
            </View>
            <Icon name="chevron_right" size={20} color={Colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ----------------------------- Byttebørs tab ---------------------------- */

function BytteboersTab({ onOpen }: { onOpen: () => void }) {
  return (
    <View style={styles.section}>
      {/* Anbefal en kollega */}
      <View>
        <View style={styles.titleDividerRow}>
          <Txt font="display" size={18} color={Colors.text}>
            Anbefal en kollega
          </Txt>
          <View style={styles.titleDivider} />
        </View>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [styles.recommendRow, pressed && styles.pressed]}>
          <View style={styles.recommendIcon}>
            <Icon name="person_add" size={24} color={Colors.pink} />
          </View>
          <View style={styles.rowBody}>
            <Txt font="semibold" size={14} color={Colors.text}>
              Anbefal en ny kollega
            </Txt>
            <Txt font="regular" size={12} color={Colors.muted} style={styles.preview}>
              Kender du et nyt talent? Tip os og modtag en bonus.
            </Txt>
          </View>
          <Icon name="chevron_right" size={20} color={Colors.muted} />
        </Pressable>
      </View>

      {/* Byttebørs */}
      <View>
        <View style={styles.titleDividerRow}>
          <Txt font="display" size={18} color={Colors.text}>
            Byttebørs
          </Txt>
          <View style={styles.titleDivider} />
          <Pressable
            onPress={onOpen}
            style={({ pressed }) => [styles.opretBtn, pressed && styles.pressed]}>
            <Txt font="bold" size={12} color={Colors.onPink}>
              Opret
            </Txt>
          </Pressable>
        </View>
        <View style={styles.swapList}>
          {SWAPS.map((sw) => (
            <View key={sw.id} style={styles.swapCard}>
              <View style={[styles.swapBar, { backgroundColor: sw.barColor }]} />
              <View style={styles.swapHeader}>
                <View style={styles.flex}>
                  <View
                    style={[
                      styles.swapTag,
                      { backgroundColor: sw.tagBg, borderColor: sw.tagBorder },
                    ]}>
                    <Txt font="bold" size={10} color={sw.tagColor} tracking={1} uppercase>
                      {sw.tag}
                    </Txt>
                  </View>
                  <Txt font="display" size={18} color={Colors.text} style={styles.swapTitle}>
                    {sw.title}
                  </Txt>
                </View>
                <Icon name={sw.icon} size={24} color={Colors.muted} />
              </View>
              <View style={styles.swapMeta}>
                <View style={styles.metaRow}>
                  <Icon name="schedule" size={18} color={Colors.muted} />
                  <Txt font="regular" size={13} color={Colors.muted}>
                    {sw.dur}
                  </Txt>
                </View>
                <View style={styles.metaRow}>
                  <Icon name="near_me" size={18} color={Colors.muted} />
                  <Txt font="regular" size={13} color={Colors.muted}>
                    {sw.loc}
                  </Txt>
                </View>
              </View>
              <Pressable
                onPress={onOpen}
                style={({ pressed }) => [styles.swapBtn, pressed && styles.pressed]}>
                <Txt font="bold" size={14} color={Colors.text}>
                  Aftal nærmere
                </Txt>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* -------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pressed: { opacity: 0.75 },
  tabs: { marginBottom: Spacing.xl },
  section: { gap: Spacing.xxl },

  /* Vica AI row */
  vicaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    backgroundColor: 'rgba(98,226,166,0.10)',
    borderWidth: 1.5,
    borderColor: Alpha.successBorder,
  },
  vicaTile: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(98,226,166,0.16)',
    borderWidth: 1,
    borderColor: Alpha.successBorder,
  },
  aiBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Alpha.successTint,
    borderWidth: 1,
    borderColor: 'rgba(98,226,166,0.3)',
  },
  vicaStatus: { marginTop: 3 },

  /* Section headings */
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: Spacing.md,
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  list: { gap: 10 },

  /* Conversation / support rows */
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.lg,
    padding: 14,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  avatarWrap: { position: 'relative' },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24,29,62,0.9)',
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  rowBody: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  preview: { marginTop: 4 },
  rowTrailing: { alignItems: 'flex-end', gap: 6 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Byttebørs */
  titleDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 14,
  },
  titleDivider: {
    flex: 1,
    height: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
    opacity: 0.4,
  },
  opretBtn: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  recommendIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217,74,230,0.10)',
  },
  swapList: { gap: 14 },
  swapCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    overflow: 'hidden',
    gap: Spacing.md,
  },
  swapBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.4,
  },
  swapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  flex: { flex: 1 },
  swapTag: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  swapTitle: { marginTop: 10 },
  swapMeta: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  swapBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
});
