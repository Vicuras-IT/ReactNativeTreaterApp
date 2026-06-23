import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  DesignBackground,
  Icon,
  Toggle,
  Txt,
} from '@/components/ui';
import { Alpha, Colors, Radius, Spacing } from '@/theme';

/* ------------------------------------------------------------------ */
/* Demo data                                                          */
/* ------------------------------------------------------------------ */

const TEAM_LEAD = {
  initials: 'MK',
  name: 'Mette Kjær',
  role: 'Team Lead · Region Hovedstaden',
  note: 'Jeg glæder mig til at tage imod dig. Skriv endelig, hvis du har spørgsmål før din første dag.',
};

interface TeamMember {
  initials: string;
  name: string;
  city: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { initials: 'AJ', name: 'Anders J.', city: 'København' },
  { initials: 'SL', name: 'Sara L.', city: 'Frederiksberg' },
  { initials: 'TM', name: 'Thomas M.', city: 'Roskilde' },
  { initials: 'NP', name: 'Nina P.', city: 'Hillerød' },
  { initials: 'KB', name: 'Kasper B.', city: 'Glostrup' },
  { initials: 'LH', name: 'Lærke H.', city: 'Lyngby' },
];

interface ScheduleDay {
  day: string;
  place?: string;
  time?: string;
  fri?: boolean;
}

const EVEN_WEEK: ScheduleDay[] = [
  { day: 'Man', place: 'Novo Nordisk A/S', time: '07:00 – 15:00' },
  { day: 'Tirs', place: 'Aarhus Universitetshosp.', time: '10:00 – 18:00' },
  { day: 'Ons', place: 'Maersk HQ', time: '08:00 – 16:00' },
  { day: 'Tors', place: 'Carlsberg Byen', time: '09:00 – 17:00' },
  { day: 'Fre', fri: true },
];

const ODD_WEEK: ScheduleDay[] = [
  { day: 'Man', place: 'Danske Bank', time: '08:00 – 16:00' },
  { day: 'Tirs', fri: true },
  { day: 'Ons', place: 'Novo Nordisk A/S', time: '07:00 – 15:00' },
  { day: 'Tors', place: 'Grundfos Bjerringbro', time: '10:00 – 18:00' },
  { day: 'Fre', place: 'Vestas Aarhus', time: '09:00 – 15:00' },
];

interface DidYouKnow {
  icon: string;
  title: string;
  body: string;
  cta: string;
}

const DID_YOU_KNOW: DidYouKnow[] = [
  {
    icon: 'workspace_premium',
    title: 'Du kan optjene medaljer',
    body: 'Hver behandling og god anmeldelse tæller. Saml medaljer og lås op for bonusser undervejs.',
    cta: 'Se medaljer',
  },
  {
    icon: 'swap_horiz',
    title: 'Byttebørsen er din ven',
    body: 'Kan du ikke tage en vagt? Tilbyd den til kollegerne på byttebørsen med ét tryk.',
    cta: 'Læs mere',
  },
  {
    icon: 'savings',
    title: 'Pension fra dag ét',
    body: 'Vi indbetaler til din pension fra første vagt. Se dine ordninger under Profil.',
    cta: 'Se ordninger',
  },
];

interface Pref {
  key: string;
  icon: string;
  title: string;
  body: string;
}

const PREFS: Pref[] = [
  {
    key: 'faceId',
    icon: 'fingerprint',
    title: 'Face ID / fingeraftryk',
    body: 'Log hurtigt og sikkert ind med biometri.',
  },
  {
    key: 'calendar',
    icon: 'calendar_month',
    title: 'Synkroniser kalender',
    body: 'Læg dine vagter direkte i din telefonkalender.',
  },
  {
    key: 'push',
    icon: 'notifications',
    title: 'Push-notifikationer',
    body: 'Få besked om nye vagtanmodninger og ændringer.',
  },
];

/* ------------------------------------------------------------------ */
/* Step machine                                                       */
/* ------------------------------------------------------------------ */

const STEP_LABELS = [
  'Velkommen · 1 af 6',
  'Dit team · 2 af 6',
  'Dit skema · 3 af 6',
  'Gode tips · 4 af 6',
  'Indstillinger · 5 af 6',
  'Du er klar · 6 af 6',
];

const TOTAL_STEPS = STEP_LABELS.length;

export function OnboardingScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [week, setWeek] = useState<'even' | 'odd'>('even');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    faceId: true,
    calendar: true,
    push: true,
  });

  const isLast = step === TOTAL_STEPS - 1;

  const next = () => {
    if (isLast) onBack();
    else setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const togglePref = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <DesignBackground>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Icon name="medical_services" size={22} color={Colors.pink} />
            <Txt font="displayBold" size={18} color={Colors.pink}>
              Vicuras
            </Txt>
          </View>
          <Pressable onPress={onBack} hitSlop={10}>
            <Txt font="bold" size={13} color={Colors.lilac}>
              Spring over
            </Txt>
          </Pressable>
        </View>

        {/* Main */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.main}
          showsVerticalScrollIndicator={false}>
          <Txt
            font="bold"
            size={11}
            color={Colors.muted}
            tracking={2}
            uppercase
            align="center"
            style={styles.stepLabel}>
            {STEP_LABELS[step]}
          </Txt>

          {step === 0 ? <WelcomeStep /> : null}
          {step === 1 ? <TeamStep /> : null}
          {step === 2 ? <ScheduleStep week={week} onWeek={setWeek} /> : null}
          {step === 3 ? <TipsStep /> : null}
          {step === 4 ? (
            <SettingsStep prefs={prefs} onToggle={togglePref} />
          ) : null}
          {step === 5 ? <DoneStep /> : null}
        </ScrollView>

        {/* Footer */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.dots}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
          <Pressable
            onPress={next}
            style={({ pressed }) => [
              styles.nextBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}>
            <Txt font="bold" size={15} color={Colors.text}>
              {isLast ? 'Færdig' : 'Næste'}
            </Txt>
            <Icon
              name={isLast ? 'check' : 'arrow_forward'}
              size={20}
              color={Colors.text}
            />
          </Pressable>
        </View>
      </View>
    </DesignBackground>
  );
}

/* ------------------------------------------------------------------ */
/* Step 0 — Velkommen                                                 */
/* ------------------------------------------------------------------ */

function WelcomeStep() {
  return (
    <View style={styles.centerStep}>
      <View style={styles.videoCard}>
        <View style={styles.videoGlow} />
        <View style={styles.playBtn}>
          <Icon name="play_arrow" size={38} color={Colors.onPink} />
        </View>
        <View style={styles.videoCaption}>
          <Txt
            font="medium"
            size={10}
            color={Colors.muted}
            tracking={1.6}
            uppercase>
            Video · 0:30
          </Txt>
          <Txt font="semibold" size={13} color={Colors.text} style={styles.gap4}>
            En hilsen fra HR
          </Txt>
        </View>
      </View>
      <View style={styles.centerCopy}>
        <Txt font="displayBold" size={26} color={Colors.text} align="center">
          Velkommen ombord 👋
        </Txt>
        <Txt
          font="regular"
          size={15}
          color={Colors.muted}
          align="center"
          lineHeight={24}
          style={styles.gap14}>
          Vores HR-chef byder dig velkommen på vegne af hele Vicuras. Din Team
          Lead tager imod dig personligt på din første dag.
        </Txt>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Mød dit team                                              */
/* ------------------------------------------------------------------ */

function TeamStep() {
  return (
    <View style={styles.colStep}>
      <View>
        <Txt font="displayBold" size={26} color={Colors.text}>
          Mød dit team
        </Txt>
        <Txt
          font="regular"
          size={14}
          color={Colors.muted}
          lineHeight={22}
          style={styles.gap10}>
          Dit team er dit anker hos Vicuras.
        </Txt>
      </View>

      {/* Team Lead */}
      <View style={styles.leadCard}>
        <Avatar initials={TEAM_LEAD.initials} size={60} fontSize={20} />
        <View style={styles.flex}>
          <View style={styles.leadBadge}>
            <Txt
              font="bold"
              size={9}
              color={Colors.pink}
              tracking={1.2}
              uppercase>
              Din Team Lead
            </Txt>
          </View>
          <Txt font="displayBold" size={17} color={Colors.text} style={styles.gap4}>
            {TEAM_LEAD.name}
          </Txt>
          <Txt font="regular" size={12} color={Colors.muted} style={styles.gap2}>
            {TEAM_LEAD.role}
          </Txt>
        </View>
      </View>
      <Txt
        font="regular"
        size={13}
        color="#C7C5DA"
        lineHeight={20}
        style={styles.italic}>
        “{TEAM_LEAD.note}”
      </Txt>

      {/* Grid */}
      <View style={styles.grid}>
        {TEAM_MEMBERS.map((tm) => (
          <View key={tm.initials} style={styles.memberCard}>
            <Avatar initials={tm.initials} size={46} fontSize={14} />
            <Txt
              font="bold"
              size={12}
              color={Colors.text}
              align="center"
              numberOfLines={1}>
              {tm.name}
            </Txt>
            <View style={styles.cityRow}>
              <Icon name="location_on" size={12} color={Colors.muted} />
              <Txt font="regular" size={10} color={Colors.muted} numberOfLines={1}>
                {tm.city}
              </Txt>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Icon name="forum" size={22} color={Colors.lilac} />
        <Txt
          font="regular"
          size={12.5}
          color="#C7C5DA"
          lineHeight={19}
          style={styles.flex}>
          Husk, at I har en team-chat her i appen, hvor I altid kan nå hinanden.
        </Txt>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Dit skema                                                 */
/* ------------------------------------------------------------------ */

function ScheduleStep({
  week,
  onWeek,
}: {
  week: 'even' | 'odd';
  onWeek: (w: 'even' | 'odd') => void;
}) {
  const days = week === 'even' ? EVEN_WEEK : ODD_WEEK;
  return (
    <View style={styles.colStep}>
      <View>
        <Txt font="displayBold" size={26} color={Colors.text}>
          Dit skema venter
        </Txt>
        <Txt
          font="regular"
          size={14}
          color={Colors.muted}
          lineHeight={22}
          style={styles.gap10}>
          Din vagtplan kører i en 2-ugers rytme. Se dine faste dage i lige og
          ulige uger.
        </Txt>
      </View>

      {/* Week toggle */}
      <View style={styles.weekTabs}>
        {(['even', 'odd'] as const).map((w) => {
          const active = w === week;
          return (
            <Pressable
              key={w}
              onPress={() => onWeek(w)}
              style={[styles.weekTab, active && styles.weekTabActive]}>
              <Txt
                font="bold"
                size={13}
                color={active ? Colors.onPink : Colors.muted}>
                {w === 'even' ? 'Lige uge' : 'Ulige uge'}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {/* Day rows */}
      <View style={styles.scheduleCard}>
        {days.map((d, i) => (
          <View
            key={d.day}
            style={[
              styles.dayRow,
              i < days.length - 1 && styles.dayRowBorder,
            ]}>
            <Txt font="bold" size={12} color={Colors.text} style={styles.dayName}>
              {d.day}
            </Txt>
            {d.fri ? (
              <View style={styles.friRow}>
                <Icon name="bedtime" size={16} color={Colors.faint} />
                <Txt font="regular" size={12} color={Colors.faint}>
                  Fri · ingen vagt
                </Txt>
              </View>
            ) : (
              <View style={styles.flex}>
                <Txt
                  font="semibold"
                  size={12.5}
                  color={Colors.text}
                  numberOfLines={1}>
                  {d.place}
                </Txt>
                <Txt font="regular" size={11} color={Colors.muted} style={styles.gap2}>
                  {d.time}
                </Txt>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Vidste du at…                                             */
/* ------------------------------------------------------------------ */

function TipsStep() {
  return (
    <View style={styles.colStep}>
      <Txt font="displayBold" size={26} color={Colors.text}>
        Vidste du, at…?
      </Txt>
      <View style={styles.tipList}>
        {DID_YOU_KNOW.map((dk) => (
          <View key={dk.title} style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name={dk.icon} size={22} color={Colors.pink} />
            </View>
            <View style={styles.flex}>
              <Txt font="display" size={15} color={Colors.text}>
                {dk.title}
              </Txt>
              <Txt
                font="regular"
                size={12.5}
                color={Colors.muted}
                lineHeight={19}
                style={styles.gap4}>
                {dk.body}
              </Txt>
              <View style={styles.tipCta}>
                <Txt font="bold" size={12} color={Colors.pink}>
                  {dk.cta}
                </Txt>
                <Icon name="arrow_forward" size={15} color={Colors.pink} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Indstillinger                                             */
/* ------------------------------------------------------------------ */

function SettingsStep({
  prefs,
  onToggle,
}: {
  prefs: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <View style={styles.colStep}>
      <View>
        <Txt font="displayBold" size={26} color={Colors.text}>
          Kom godt i gang
        </Txt>
        <Txt
          font="regular"
          size={14}
          color={Colors.muted}
          lineHeight={22}
          style={styles.gap10}>
          Vælg dine indstillinger nu — du kan altid ændre dem senere under
          Profil.
        </Txt>
      </View>

      <View style={styles.tipList}>
        {PREFS.map((p) => (
          <View key={p.key} style={styles.prefCard}>
            <View style={styles.tipIcon}>
              <Icon name={p.icon} size={22} color={Colors.pink} />
            </View>
            <View style={styles.flex}>
              <Txt font="display" size={15} color={Colors.text}>
                {p.title}
              </Txt>
              <Txt
                font="regular"
                size={12}
                color={Colors.muted}
                lineHeight={18}
                style={styles.gap4}>
                {p.body}
              </Txt>
            </View>
            <Toggle value={!!prefs[p.key]} onChange={() => onToggle(p.key)} />
          </View>
        ))}
      </View>

      <View style={styles.lockNote}>
        <Icon name="lock" size={14} color={Colors.muted} />
        <Txt
          font="regular"
          size={11}
          color={Colors.muted}
          style={[styles.flex, styles.italic]}>
          SMS på vagtanmodninger er altid slået til.
        </Txt>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Du er klar                                                */
/* ------------------------------------------------------------------ */

function DoneStep() {
  return (
    <View style={styles.centerStep}>
      <View style={styles.doneHero}>
        <Icon name="favorite" size={60} color={Colors.pink} />
      </View>
      <View style={styles.centerCopy}>
        <Txt font="displayBold" size={25} color={Colors.text} align="center">
          Du er klar! 🎉
        </Txt>
        <Txt
          font="regular"
          size={15}
          color={Colors.muted}
          align="center"
          lineHeight={24}
          style={styles.gap16}>
          Hver dag hjælper vi hundredvis af mennesker med at forebygge smerter
          og fremme trivsel på danske arbejdspladser.
        </Txt>
        <Txt
          font="semibold"
          size={15}
          color={Colors.text}
          align="center"
          lineHeight={24}
          style={styles.gap14}>
          Nu er du en del af det. Tusind tak, fordi du er med os. 😊
        </Txt>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, flexShrink: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 18,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  main: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  stepLabel: { marginBottom: Spacing.lg },

  centerStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
    paddingVertical: Spacing.xxl,
  },
  centerCopy: { maxWidth: 320, alignItems: 'center' },
  colStep: { flex: 1, gap: 18 },

  /* Welcome video card */
  videoCard: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 9 / 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#10143F',
    borderWidth: 1,
    borderColor: Alpha.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(217,74,230,0.12)',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  videoCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(8,11,40,0.6)',
  },

  /* Team lead */
  leadCard: {
    borderRadius: Radius.xxl,
    padding: 18,
    backgroundColor: Alpha.pinkTint,
    borderWidth: 1.5,
    borderColor: Alpha.pinkBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  leadBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Alpha.pinkTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  /* Team grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  memberCard: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 6,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  infoCard: {
    borderRadius: Radius.lg,
    padding: 14,
    backgroundColor: 'rgba(122,132,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(122,132,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  /* Schedule */
  weekTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(13,19,64,0.7)',
  },
  weekTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  weekTabActive: { backgroundColor: Colors.pink },
  scheduleCard: {
    borderRadius: Radius.xxl,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    paddingHorizontal: Spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 11,
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Alpha.divider,
  },
  dayName: { width: 46 },
  friRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  /* Tips + prefs */
  tipList: { gap: Spacing.md },
  tipCard: {
    borderRadius: Radius.xl,
    padding: 16,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  prefCard: {
    borderRadius: Radius.xl,
    padding: 16,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Alpha.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  lockNote: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  /* Done hero */
  doneHero: {
    width: 120,
    height: 120,
    borderRadius: Radius.pill,
    backgroundColor: Alpha.pinkTint,
    borderWidth: 1.5,
    borderColor: Alpha.pinkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: 32,
    paddingTop: Spacing.sm,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { height: 8, borderRadius: Radius.pill },
  dotActive: { width: 24, backgroundColor: Colors.pink },
  dotInactive: { width: 8, backgroundColor: Alpha.track },
  nextBtn: {
    width: '100%',
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.pink,
    backgroundColor: Alpha.pinkTint,
  },

  /* Spacing helpers */
  gap2: { marginTop: 2 },
  gap4: { marginTop: 4 },
  gap10: { marginTop: 10 },
  gap14: { marginTop: 14 },
  gap16: { marginTop: 16 },
  italic: { fontStyle: 'italic' },
});
