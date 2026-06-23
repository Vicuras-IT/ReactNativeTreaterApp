import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignBackground, Icon, Txt, useToast } from '@/components/ui';
import { Alpha, Colors, Radius } from '@/theme';

/* ----------------------------- Demo data ------------------------------- */

interface NotifItem {
  id: string;
  icon: string;
  /** icon tint */
  color: string;
  /** card background tint */
  bg: string;
  title: string;
  body: string;
  when: string;
  unread: boolean;
}

const NOTIFICATIONS: NotifItem[] = [
  {
    id: 'n1',
    icon: 'event_available',
    color: Colors.pink,
    bg: 'rgba(217,74,230,0.10)',
    title: 'Ny vagt tildelt',
    body: 'Du er booket til en vagt i Klinik Nord i morgen kl. 09:00–15:00.',
    when: 'For 12 minutter siden',
    unread: true,
  },
  {
    id: 'n2',
    icon: 'edit_note',
    color: Colors.warning,
    bg: 'rgba(246,181,69,0.10)',
    title: 'Manglende journalføring',
    body: 'Husk at færdiggøre journalen for Mette Sørensen fra i går.',
    when: 'For 1 time siden',
    unread: true,
  },
  {
    id: 'n3',
    icon: 'workspace_premium',
    color: Colors.success,
    bg: 'rgba(98,226,166,0.10)',
    title: 'Nyt badge optjent',
    body: 'Du har gennemført 50 behandlinger og optjent “Erfaren behandler”.',
    when: 'I dag',
    unread: true,
  },
  {
    id: 'n4',
    icon: 'forum',
    color: Colors.lilac,
    bg: 'rgba(191,188,255,0.10)',
    title: 'Nyt svar i forum',
    body: 'Anders Holm svarede på dit indlæg om triggerpunktbehandling.',
    when: 'I går',
    unread: false,
  },
  {
    id: 'n5',
    icon: 'receipt_long',
    color: Colors.muted,
    bg: Alpha.glass,
    title: 'Honorar udbetalt',
    body: 'Dit honorar for maj måned er overført til din NemKonto.',
    when: 'For 3 dage siden',
    unread: false,
  },
];

interface ChangeEntry {
  id: string;
  hl: string;
  body: string;
  when: string;
}

const CHANGE_ENTRIES: ChangeEntry[] = [
  {
    id: 'c1',
    hl: 'Onsdag 25. juni',
    body: 'din vagt er flyttet fra Klinik Syd til Klinik Nord.',
    when: 'For 2 timer siden',
  },
  {
    id: 'c2',
    hl: 'Fredag 27. juni',
    body: 'aftenvagten er forlænget til kl. 20:00.',
    when: 'I går',
  },
  {
    id: 'c3',
    hl: 'Mandag 30. juni',
    body: 'din vagt er aflyst pga. ombygning af klinikken.',
    when: 'For 2 dage siden',
  },
  {
    id: 'c4',
    hl: 'Tirsdag 1. juli',
    body: 'ny vagt tilføjet kl. 10:00–16:00 i Klinik Vest.',
    when: 'For 3 dage siden',
  },
];

interface GuideEntry {
  id: string;
  place: string;
  body: string;
  when: string;
}

const GUIDE_ENTRIES: GuideEntry[] = [
  {
    id: 'g1',
    place: 'Hygiejne & desinfektion',
    body: 'Opdateret vejledning til rengøring af behandlingsleje mellem klienter. Læs de nye trin inden din næste vagt.',
    when: 'For 4 dage siden',
  },
];

/* ------------------------------ Screen --------------------------------- */

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [read, setRead] = useState<Record<string, boolean>>({});

  const markAllRead = () => {
    setRead(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, true])));
    toast.show('Alle notifikationer er markeret som læst');
  };

  return (
    <DesignBackground>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={8}>
          <Icon name="arrow_back" size={20} color={Colors.text} />
        </Pressable>
        <Txt font="displayBold" size={19} color={Colors.text} style={styles.title}>
          Notifikationer
        </Txt>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Txt font="bold" size={12} color={Colors.pink}>
            Markér alle læst
          </Txt>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((n) => (
          <NotificationRow
            key={n.id}
            item={n}
            unread={n.unread && !read[n.id]}
            onPress={() => toast.show(n.title)}
          />
        ))}

        <View style={styles.updates}>
          <Txt
            font="bold"
            size={11}
            color={Colors.muted}
            tracking={1.3}
            uppercase
            style={styles.updatesLabel}>
            Opdateringer & vejledninger
          </Txt>

          <Accordion
            icon="calendar_today"
            iconColor={Colors.lilac}
            iconBg="rgba(191,194,255,0.10)"
            title="Vagtplan ændringer"
            subtitle="Hold dig opdateret på de seneste ændringer"
            count={CHANGE_ENTRIES.length}>
            {CHANGE_ENTRIES.map((e, i) => (
              <View
                key={e.id}
                style={[
                  styles.accRow,
                  i < CHANGE_ENTRIES.length - 1 && styles.accRowBorder,
                ]}>
                <Txt font="regular" size={14} color={Colors.text} lineHeight={20}>
                  <Txt font="semibold" size={14} color={Colors.pink}>
                    {e.hl}
                  </Txt>{' '}
                  {e.body}
                </Txt>
                <Txt
                  font="medium"
                  size={10}
                  color="rgba(158,164,216,0.6)"
                  tracking={0.5}
                  uppercase
                  style={styles.accWhen}>
                  {e.when}
                </Txt>
              </View>
            ))}
          </Accordion>

          <Accordion
            icon="menu_book"
            iconColor="#C2C2F9"
            iconBg="rgba(194,194,249,0.10)"
            title="Behandlervejledninger"
            subtitle="Seneste ændringer til vejledninger"
            count={GUIDE_ENTRIES.length}>
            {GUIDE_ENTRIES.map((g) => (
              <View key={g.id} style={styles.accRow}>
                <Txt
                  font="displayBold"
                  size={13}
                  color={Colors.pink}
                  tracking={0.6}
                  uppercase
                  style={styles.guidePlace}>
                  {g.place}
                </Txt>
                <Txt font="regular" size={14} color={Colors.text} lineHeight={21}>
                  {g.body}
                </Txt>
                <Txt
                  font="medium"
                  size={10}
                  color="rgba(158,164,216,0.6)"
                  tracking={0.5}
                  uppercase
                  style={styles.guideWhen}>
                  {g.when}
                </Txt>
              </View>
            ))}
          </Accordion>
        </View>
      </ScrollView>
    </DesignBackground>
  );
}

/* --------------------------- Sub-components ----------------------------- */

function NotificationRow({
  item,
  unread,
  onPress,
}: {
  item: NotifItem;
  unread: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notifRow,
        { backgroundColor: item.bg },
        pressed && styles.pressed,
      ]}>
      <View style={styles.notifIcon}>
        <Icon name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.notifText}>
        <View style={styles.notifTitleRow}>
          <Txt font="bold" size={14} color={Colors.text} style={styles.shrink}>
            {item.title}
          </Txt>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <Txt
          font="regular"
          size={12.5}
          color={Colors.muted}
          lineHeight={19}
          style={styles.notifBody}>
          {item.body}
        </Txt>
        <Txt
          font="medium"
          size={10}
          color={Colors.faint}
          tracking={0.6}
          uppercase
          style={styles.notifWhen}>
          {item.when}
        </Txt>
      </View>
    </Pressable>
  );
}

function Accordion({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  count,
  children,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.accordion}>
      <Pressable
        style={({ pressed }) => [styles.accHeader, pressed && styles.pressed]}
        onPress={() => setOpen((o) => !o)}>
        <View style={styles.accHeaderLeft}>
          <View style={[styles.accIcon, { backgroundColor: iconBg }]}>
            <Icon name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.shrink}>
            <Txt font="semibold" size={14} color={Colors.text}>
              {title}
            </Txt>
            <Txt
              font="regular"
              size={12}
              color={Colors.muted}
              style={styles.accSubtitle}>
              {subtitle}
            </Txt>
          </View>
        </View>
        <View style={styles.accHeaderRight}>
          <View style={styles.countBadge}>
            <Txt font="bold" size={11} color={Colors.onPink}>
              {count}
            </Txt>
          </View>
          <Icon
            name={open ? 'expand_less' : 'expand_more'}
            size={20}
            color={Colors.muted}
          />
        </View>
      </Pressable>
      {open ? <View style={styles.accBody}>{children}</View> : null}
    </View>
  );
}

/* ------------------------------ Styles --------------------------------- */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  pressed: { opacity: 0.7 },
  shrink: { flexShrink: 1 },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  notifText: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
  },
  notifBody: { marginTop: 4 },
  notifWhen: { marginTop: 6 },

  updates: { marginTop: 8, gap: 12 },
  updatesLabel: { marginTop: 4, marginHorizontal: 2 },

  accordion: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  accHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  accIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accSubtitle: { marginTop: 2 },
  accHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accBody: {
    borderTopWidth: 1,
    borderTopColor: Alpha.hairlineSoft,
    backgroundColor: 'rgba(20,25,57,0.5)',
  },
  accRow: { padding: 16 },
  accRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  accWhen: { marginTop: 4 },
  guidePlace: { marginBottom: 4 },
  guideWhen: { marginTop: 8 },
});
