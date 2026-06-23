import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  Divider,
  GlassCard,
  HeaderIconButton,
  Icon,
  PinkButton,
  Toggle,
  Txt,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/state/auth-context';
import { useNav } from '@/state/navigation-context';
import { useUser } from '@/state/user-context';
import { Alpha, Colors, Radius, Spacing } from '@/theme';

const EMPTY = '—';

/** Days shown in the "Tilgængelighed" availability grid. */
const AVAIL_DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'] as const;

/** Notification matrix rows (Push / SMS / Mail per type). */
interface NotifRow {
  key: string;
  label: string;
  /** SMS column is locked-on (always enabled, not toggleable) for this row. */
  smsLocked?: boolean;
}

const NOTIF_ROWS: NotifRow[] = [
  { key: 'shiftRequest', label: 'Vagtanmodninger', smsLocked: true },
  { key: 'shiftChange', label: 'Vagtændringer' },
  { key: 'newBooking', label: 'Nye bookinger' },
  { key: 'reminders', label: 'Påmindelser' },
  { key: 'news', label: 'Nyheder & beskeder' },
];

type NotifChannel = 'push' | 'sms' | 'mail';

interface DocRow {
  key: string;
  label: string;
  type: string;
}

const DOC_VIDEOS: DocRow[] = [
  { key: 'v1', label: 'Sådan modtager du en vagt', type: 'Video' },
  { key: 'v2', label: 'Hygiejne og klargøring', type: 'Video' },
  { key: 'v3', label: 'Brug af behandlerportalen', type: 'Video' },
];

const DOC_FILES: DocRow[] = [
  { key: 'f1', label: 'Behandlerhåndbog 2026', type: 'PDF' },
  { key: 'f2', label: 'Persondatapolitik', type: 'PDF' },
  { key: 'f3', label: 'Arbejdsmiljøguide', type: 'PDF' },
  { key: 'f4', label: 'Faktura-skabelon', type: 'DOCX' },
];

export function ProfileScreen() {
  const { profile, loading, error, reload } = useUser();
  const { signOut, biometricsEnabled, setBiometricsEnabled } = useAuth();
  const nav = useNav();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // Accordion open state.
  const [openSection, setOpenSection] = useState<string | null>('contact');
  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? null : key));

  // Demo availability state (Lige / Ulige per day).
  const [avail, setAvail] = useState<
    Record<string, { lige: boolean; ulige: boolean }>
  >(() =>
    Object.fromEntries(
      AVAIL_DAYS.map((d, i) => [
        d,
        { lige: i < 3, ulige: i % 2 === 0 },
      ]),
    ),
  );
  const toggleAvail = (day: string, type: 'lige' | 'ulige') =>
    setAvail((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: !prev[day][type] },
    }));

  // Demo notification matrix state.
  const [notif, setNotif] = useState<
    Record<string, Record<NotifChannel, boolean>>
  >(() =>
    Object.fromEntries(
      NOTIF_ROWS.map((r) => [
        r.key,
        { push: true, sms: !!r.smsLocked, mail: r.key === 'news' },
      ]),
    ),
  );
  const toggleNotif = (rowKey: string, channel: NotifChannel) =>
    setNotif((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [channel]: !prev[rowKey][channel] },
    }));

  // Demo settings toggles.
  const [calendarSync, setCalendarSync] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  const onToggleBiometrics = async (next: boolean) => {
    if (bioBusy) return;
    setBioBusy(true);
    try {
      await setBiometricsEnabled(next);
      toast.show(next ? 'Face ID slået til' : 'Face ID slået fra');
    } finally {
      setBioBusy(false);
    }
  };

  // --- Loading / error gates -------------------------------------------------
  if (loading && !profile) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.pink} />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <GlassCard style={styles.errorCard}>
          <Icon name="error" size={22} color={Colors.danger} />
          <Txt font="semibold" size={14} color={Colors.text} align="center">
            Kunne ikke hente profil
          </Txt>
          <Txt font="regular" size={12.5} color={Colors.muted} align="center">
            {error}
          </Txt>
          <PinkButton label="Prøv igen" icon="refresh" onPress={reload} />
        </GlassCard>
      </View>
    );
  }

  const fullName = profile?.fullName?.trim() || 'Lars Holm';
  const role = profile?.treatmentTypes?.[0]?.trim() || 'Behandler';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.sm },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Txt font="displayExtrabold" size={22} color={Colors.pink}>
          Vicuras
        </Txt>
        <HeaderIconButton
          icon="notifications"
          onPress={nav.openNotifications}
        />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Avatar
          size={88}
          fontSize={32}
          initials={profile?.initials || 'LH'}
          pictureBase64={profile?.pictureBase64}
        />
        <View style={styles.heroText}>
          <Txt font="displayBold" size={24} color={Colors.text} align="center">
            {fullName}
          </Txt>
          <Txt
            font="regular"
            size={13}
            color={Colors.muted}
            align="center"
            style={styles.heroSub}>
            {role} · Vicuras Professional Healthcare
          </Txt>
        </View>

        {/* Stat cards */}
        <View style={styles.statRow}>
          <StatCard icon="star" value="4,9" label="Rating" />
          <StatCard icon="spa" value="1.284" label="Behandlinger" />
          <StatCard icon="workspace_premium" value="7" label="Medaljer" />
        </View>
      </View>

      {/* Quick links */}
      <View style={styles.group}>
        <LinkRow
          icon="workspace_premium"
          title="Mine medaljer"
          sub="Se dine optjente medaljer"
          onPress={nav.openMedals}
        />
        <LinkRow
          icon="menu_book"
          title="Behandlervejledning"
          sub="Retningslinjer og procedurer"
          onPress={() => nav.openTreatmentGuide()}
        />
        <LinkRow
          icon="inventory_2"
          title="Materialer"
          sub="Bestil utensilier og forbrugsvarer"
          onPress={nav.openOrderMaterials}
        />
        <LinkRow
          icon="payments"
          title="Løn & udbetaling"
          sub="Se din lønhistorik"
          onPress={() => toast.show('Løn & udbetaling kommer snart')}
        />
        <LinkRow
          icon="play_circle"
          title="Se introduktion"
          sub="Gennemgå app-introduktionen igen"
          onPress={nav.openOnboarding}
        />
      </View>

      {/* ===== Profil (accordions) ===== */}
      <View>
        <SectionHeading>Profil</SectionHeading>
        <View style={styles.group}>
          <Accordion
            title="Kontaktoplysninger"
            open={openSection === 'contact'}
            onToggle={() => toggleSection('contact')}>
            <ContactRow label="Telefon" value={profile?.mobilePhone} />
            <ContactRow label="Email" value={profile?.primaryEmail} />
            <ContactRow label="Adresse" value={profile?.address} alignRight />
          </Accordion>

          <Accordion
            title="Tilgængelighed"
            open={openSection === 'availability'}
            onToggle={() => toggleSection('availability')}>
            <View style={styles.availHeaderRow}>
              <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase style={styles.flex}>
                Dag
              </Txt>
              <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase style={styles.availCol}>
                Lige
              </Txt>
              <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase style={styles.availCol}>
                Ulige
              </Txt>
            </View>
            <View style={styles.availList}>
              {AVAIL_DAYS.map((day) => (
                <View key={day} style={styles.availRow}>
                  <Txt font="medium" size={13} color={Colors.text} style={styles.flex}>
                    {day}
                  </Txt>
                  <View style={styles.availCol}>
                    <Toggle
                      small
                      value={avail[day].lige}
                      onChange={() => toggleAvail(day, 'lige')}
                    />
                  </View>
                  <View style={styles.availCol}>
                    <Toggle
                      small
                      value={avail[day].ulige}
                      onChange={() => toggleAvail(day, 'ulige')}
                    />
                  </View>
                </View>
              ))}
            </View>
            <ContactRow
              label="Aftenvagter"
              value={profile?.eveningShifts}
              alignRight
            />
            <Txt font="regular" size={12} color={Colors.muted} style={styles.italicNote}>
              Vælg de dage og ugetyper, hvor du er tilgængelig for vagter.
            </Txt>
            <PinkButton
              label="Gem ændringer"
              expand
              onPress={() => toast.show('Tilgængelighed gemt')}
              style={styles.availSave}
            />
          </Accordion>

          <Accordion
            title="Notifikationer"
            open={openSection === 'notifications'}
            onToggle={() => toggleSection('notifications')}>
            <View style={styles.notifHeaderRow}>
              <Txt font="bold" size={10} color={Colors.pink} tracking={1} uppercase style={styles.flex}>
                Notifikation
              </Txt>
              {(['Push', 'SMS', 'Mail'] as const).map((c) => (
                <Txt
                  key={c}
                  font="bold"
                  size={9}
                  color={Colors.muted}
                  tracking={0.5}
                  uppercase
                  align="center"
                  style={styles.notifCol}>
                  {c}
                </Txt>
              ))}
            </View>
            <View style={styles.notifList}>
              {NOTIF_ROWS.map((row) => (
                <View key={row.key} style={styles.notifRow}>
                  <Txt font="medium" size={12.5} color={Colors.text} style={styles.flex}>
                    {row.label}
                  </Txt>
                  <View style={styles.notifCol}>
                    <Toggle
                      small
                      value={notif[row.key].push}
                      onChange={() => toggleNotif(row.key, 'push')}
                    />
                  </View>
                  <View style={styles.notifCol}>
                    {row.smsLocked ? (
                      <View style={styles.lockedToggle}>
                        <Icon name="lock" size={12} color={Colors.white} />
                      </View>
                    ) : (
                      <Toggle
                        small
                        value={notif[row.key].sms}
                        onChange={() => toggleNotif(row.key, 'sms')}
                      />
                    )}
                  </View>
                  <View style={styles.notifCol}>
                    <Toggle
                      small
                      value={notif[row.key].mail}
                      onChange={() => toggleNotif(row.key, 'mail')}
                    />
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.lockNote}>
              <Icon name="lock" size={14} color={Colors.muted} />
              <Txt font="regular" size={11} color={Colors.muted} style={styles.flex}>
                SMS på vagtanmodninger er altid slået til.
              </Txt>
            </View>
          </Accordion>

          {/* Kalender sync */}
          <SettingRow
            icon="calendar_today"
            label="Synkroniser kalender"
            value={calendarSync}
            onChange={setCalendarSync}
          />

          {/* Face ID / fingeraftryk */}
          <SettingRow
            icon="fingerprint"
            label="Face ID / fingeraftryk"
            value={biometricsEnabled}
            onChange={onToggleBiometrics}
            disabled={bioBusy}
          />
        </View>
      </View>

      {/* ===== Økonomi & Fordele ===== */}
      <View>
        <SectionHeading>Økonomi &amp; Fordele</SectionHeading>
        <View style={styles.group}>
          <View style={styles.miniRow}>
            <MiniCard
              icon="event"
              label="Kurser & events"
              onPress={() => toast.show('Kurser & events kommer snart')}
            />
            <MiniCard
              icon="savings"
              label="Pension og forsikringer"
              onPress={() => toast.show('Pension og forsikringer kommer snart')}
            />
          </View>

          <GlassCard padding={16} radius={Radius.xl} style={styles.rateCard}>
            <Txt font="bold" size={15} color={Colors.text}>
              Løn
            </Txt>
            <Txt font="displayBold" size={18} color={Colors.pink}>
              425 kr/t
            </Txt>
          </GlassCard>

          <Pressable
            onPress={() => toast.show('Åbner lønsedler på mit.dk')}
            style={({ pressed }) => [styles.payslipRow, pressed && styles.pressed]}>
            <View style={styles.payslipIcon}>
              <Icon name="receipt_long" size={22} color="#7AB8FF" />
            </View>
            <View style={styles.flex}>
              <Txt font="bold" size={14} color={Colors.text}>
                Se dine lønsedler
              </Txt>
              <Txt font="regular" size={12} color={Colors.muted} style={styles.linkSub}>
                Tilgå dine lønsedler på mit.dk
              </Txt>
            </View>
            <Icon name="open_in_new" size={20} color={Colors.muted} />
          </Pressable>
        </View>
      </View>

      {/* ===== Retningslinjer ===== */}
      <View>
        <SectionHeading>Retningslinjer</SectionHeading>

        <View style={styles.docLabel}>
          <Icon name="smart_display" size={16} color={Colors.pinkBright} />
          <Txt font="bold" size={11} color={Colors.pinkBright} tracking={1} uppercase>
            Videoer
          </Txt>
        </View>
        <View style={styles.group}>
          {DOC_VIDEOS.map((d) => (
            <DocItem
              key={d.key}
              doc={d}
              icon="play_arrow"
              badgeColor={Colors.pinkBright}
              onPress={() => toast.show(`Afspiller "${d.label}"`)}
            />
          ))}
        </View>

        <View style={[styles.docLabel, styles.docLabelSpace]}>
          <Icon name="folder" size={16} color="#7AB8FF" />
          <Txt font="bold" size={11} color="#7AB8FF" tracking={1} uppercase>
            Filer
          </Txt>
        </View>
        <View style={styles.group}>
          {DOC_FILES.map((d) => (
            <DocItem
              key={d.key}
              doc={d}
              icon="description"
              badgeColor="#7AB8FF"
              onPress={() => toast.show(`Åbner "${d.label}"`)}
            />
          ))}
        </View>
      </View>

      {/* Log ud */}
      <Pressable
        onPress={() => signOut()}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Icon name="logout" size={20} color={Colors.danger} />
        <Txt font="bold" size={14} color={Colors.danger}>
          Log ud
        </Txt>
      </Pressable>

      <Txt
        font="medium"
        size={10}
        color={Colors.faint}
        align="center"
        tracking={2}
        uppercase
        style={styles.footer}>
        PORTAL V2.4.1 • VICURAS A/S
      </Txt>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Local sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Txt
      font="bold"
      size={12}
      color={Colors.muted}
      tracking={2.1}
      uppercase
      style={styles.sectionHeading}>
      {children}
    </Txt>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <GlassCard padding={12} radius={Radius.lg} style={styles.statCard}>
      <Icon name={icon} size={18} color={Colors.pink} />
      <Txt font="displayBold" size={18} color={Colors.text}>
        {value}
      </Txt>
      <Txt font="medium" size={10.5} color={Colors.muted} align="center">
        {label}
      </Txt>
    </GlassCard>
  );
}

function LinkRow({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: string;
  title: string;
  sub: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
      <View style={styles.linkIcon}>
        <Icon name={icon} size={22} color={Colors.pink} />
      </View>
      <View style={styles.flex}>
        <Txt font="bold" size={15} color={Colors.text}>
          {title}
        </Txt>
        <Txt font="regular" size={12} color={Colors.muted} style={styles.linkSub}>
          {sub}
        </Txt>
      </View>
      <Icon name="chevron_right" size={22} color={Colors.faint} />
    </Pressable>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.accordion}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.accordionHead, pressed && styles.pressed]}>
        <Txt font="bold" size={15} color={Colors.text}>
          {title}
        </Txt>
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          size={22}
          color={Colors.muted}
        />
      </Pressable>
      {open ? (
        <View style={styles.accordionBody}>
          <Divider style={styles.accordionDivider} />
          {children}
        </View>
      ) : null}
    </View>
  );
}

function ContactRow({
  label,
  value,
  alignRight,
}: {
  label: string;
  value?: string | null;
  alignRight?: boolean;
}) {
  const display = value && value.trim().length > 0 ? value : EMPTY;
  return (
    <View style={styles.contactRow}>
      <Txt font="regular" size={13} color={Colors.muted}>
        {label}
      </Txt>
      <Txt
        font="medium"
        size={14}
        color={Colors.text}
        align={alignRight ? 'right' : 'left'}
        style={styles.contactValue}>
        {display}
      </Txt>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onChange,
  disabled,
}: {
  icon: string;
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={22} color={Colors.lilac} />
        <Txt font="semibold" size={14} color={Colors.text}>
          {label}
        </Txt>
      </View>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

function MiniCard({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.miniCard, pressed && styles.pressed]}>
      <Icon name={icon} size={22} color={Colors.lilac} />
      <Txt font="semibold" size={13} color={Colors.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

function DocItem({
  doc,
  icon,
  badgeColor,
  onPress,
}: {
  doc: DocRow;
  icon: string;
  badgeColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.docRow, pressed && styles.pressed]}>
      <Icon name={icon} size={22} color={badgeColor} />
      <Txt font="bold" size={14} color={Colors.text} style={styles.flex}>
        {doc.label}
      </Txt>
      <View style={[styles.docBadge, { borderColor: badgeColor }]}>
        <Txt font="bold" size={9} color={badgeColor} tracking={0.5} uppercase>
          {doc.type}
        </Txt>
      </View>
      <Icon name="chevron_right" size={18} color={Colors.faint} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------

const surface = {
  backgroundColor: Alpha.glass,
  borderWidth: 1,
  borderColor: Alpha.hairline,
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
    gap: Spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorCard: {
    alignItems: 'center',
    gap: 10,
    maxWidth: 320,
    width: '100%',
  },
  flex: { flexShrink: 1, flexGrow: 1, flexBasis: 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Hero
  hero: { alignItems: 'center', gap: 12 },
  heroText: { alignItems: 'center' },
  heroSub: { marginTop: 4 },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  // Generic stacked group
  group: { gap: 10 },

  // Section heading
  sectionHeading: { marginBottom: 12 },

  // Link row
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.xl,
    padding: 16,
    ...surface,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Alpha.pinkBorder,
    backgroundColor: 'rgba(217,74,230,0.06)',
  },
  linkSub: { marginTop: 2 },
  pressed: { opacity: 0.7 },

  // Accordion
  accordion: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...surface,
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  accordionDivider: { backgroundColor: Alpha.divider },

  // Contact rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  contactValue: { flexShrink: 1 },

  // Availability grid
  availHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  availCol: { width: 44, alignItems: 'center' },
  availList: { gap: 8 },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(10,15,51,0.6)',
    borderRadius: Radius.pill,
  },
  italicNote: { fontStyle: 'italic', paddingHorizontal: 4 },
  availSave: { marginTop: 4 },

  // Notification matrix
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  notifCol: { width: 38, alignItems: 'center' },
  notifList: { gap: 8 },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(10,15,51,0.6)',
    borderRadius: Radius.md,
  },
  lockedToggle: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#AE05C6',
    opacity: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    marginTop: 2,
  },

  // Setting rows (calendar / face id)
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    padding: 16,
    ...surface,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Økonomi & Fordele
  miniRow: { flexDirection: 'row', gap: 10 },
  miniCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 8,
    ...surface,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payslipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.xl,
    padding: 16,
    ...surface,
  },
  payslipIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(122,184,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(122,184,255,0.3)',
  },

  // Retningslinjer
  docLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  docLabelSpace: { marginTop: 18 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radius.xl,
    padding: 16,
    ...surface,
  },
  docBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },

  // Log out
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,96,114,0.4)',
  },
  footer: { opacity: 0.6 },
});
