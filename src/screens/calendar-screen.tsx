import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, fetchSpecificDayBookings, type SpecificDayBooking } from '@/api';
import {
  Divider,
  GlassCard,
  HeaderIconButton,
  Icon,
  PillTabs,
  StatusPill,
  Toggle,
  Txt,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/state/auth-context';
import { useNav } from '@/state/navigation-context';
import { formatTime } from '@/utils/date';
import { Alpha, Colors, Radius } from '@/theme';

/* --------------------------------------------------------------------- */
/* Types & demo data                                                      */
/* --------------------------------------------------------------------- */

type SubTab = 'vagtplan' | 'okonomi' | 'fravaer' | 'vagtboers';
type CalMode = 'uge' | 'maaned';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'vagtplan', label: 'Vagtplan' },
  { key: 'okonomi', label: 'Økonomi' },
  { key: 'fravaer', label: 'Fravær' },
  { key: 'vagtboers', label: 'Vagtbørs' },
];

const CAL_MODES: { key: CalMode; label: string }[] = [
  { key: 'uge', label: 'Uge' },
  { key: 'maaned', label: 'Måned' },
];

const WEEKDAYS = ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];

interface DemoShift {
  day: number;
  account: string;
  time: string;
  location: string;
  pause: string;
}

/** Demo shifts keyed by day-of-month for the current month grid + list. */
const DEMO_SHIFTS: DemoShift[] = [
  {
    day: 6,
    account: 'Novo Nordisk A/S',
    time: '08:00 – 15:00',
    location: 'Bagsværd (6.AK)',
    pause: '11:30 – 12:00',
  },
  {
    day: 14,
    account: 'Maersk Headquarters',
    time: '09:00 – 16:00',
    location: 'Esplanaden 50, København K',
    pause: '12:00 – 12:30',
  },
  {
    day: 21,
    account: 'Grundfos Bjerringbro',
    time: '07:30 – 14:30',
    location: 'Poul Due Jensens Vej 7',
    pause: '11:00 – 11:30',
  },
  {
    day: 27,
    account: 'LEGO Billund',
    time: '08:30 – 15:30',
    location: 'Åstvej 1, Billund',
    pause: '12:00 – 12:30',
  },
];

interface DemoBooking {
  time: string;
  title: string;
  service: string;
  status: string;
  statusColor: string;
  active: boolean;
}

/** Fallback program shown if the day-view API call fails. */
const DEMO_PROGRAM: DemoBooking[] = [
  {
    time: '08:30',
    title: 'Mette Sørensen',
    service: 'Klassisk massage · 30 min',
    status: 'Igangværende',
    statusColor: Colors.success,
    active: true,
  },
  {
    time: '09:15',
    title: 'Jakob Lind',
    service: 'Sportsmassage · 45 min',
    status: 'Afventer',
    statusColor: Colors.muted,
    active: false,
  },
  {
    time: '10:30',
    title: 'Anne Holm',
    service: 'Triggerpunktsbehandling · 30 min',
    status: 'Afventer',
    statusColor: Colors.muted,
    active: false,
  },
];

interface Offer {
  id: string;
  period: string;
  place: string;
  room: string;
  roomIcon: string;
  bonus: string | null;
  desc: string | null;
  justerable: boolean;
}

const DEMO_OFFERS: Offer[] = [
  {
    id: 'o1',
    period: 'Tor 13. jun · 08:00 – 15:00',
    place: 'Vestas Aarhus',
    room: 'Behandlerrum 2 · 3. sal',
    roomIcon: 'meeting_room',
    bonus: 'Vagtbonus: 500 kr.',
    desc: 'Kollega er sygemeldt — fuld dag med 6 klienter booket.',
    justerable: true,
  },
  {
    id: 'o2',
    period: 'Fre 14. jun · 10:00 – 14:00',
    place: 'Danske Bank Holmens Kanal',
    room: 'Wellness-rum · stueetagen',
    roomIcon: 'spa',
    bonus: null,
    desc: null,
    justerable: false,
  },
  {
    id: 'o3',
    period: 'Man 17. jun · 12:00 – 18:00',
    place: 'Ørsted Kraftværksvej',
    room: 'Behandlerrum 1',
    roomIcon: 'meeting_room',
    bonus: 'Vagtbonus: 350 kr.',
    desc: 'Eftermiddagsvagt med mulighed for fast tilknytning.',
    justerable: true,
  },
];

interface FerieEntry {
  period: string;
  days: string;
  status: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  icon: string;
  sub: string;
}

const FERIE_KOMMENDE: FerieEntry[] = [
  {
    period: '8. – 14. juli 2026',
    days: '5 arbejdsdage',
    status: 'Godkendt',
    statusColor: Colors.success,
    statusBg: Alpha.successTint,
    statusBorder: Alpha.successBorder,
    icon: 'check_circle',
    sub: 'Bekræftet af planlægning den 2. juni',
  },
  {
    period: '12. – 16. august 2026',
    days: '5 arbejdsdage',
    status: 'Afventer',
    statusColor: Colors.warning,
    statusBg: Alpha.warningTint,
    statusBorder: Alpha.warningBorder,
    icon: 'schedule',
    sub: 'Sendt til godkendelse den 20. maj',
  },
];

const FERIE_AFVIKLET: FerieEntry[] = [
  {
    period: '24. – 31. marts 2026',
    days: '6 arbejdsdage',
    status: 'Afviklet',
    statusColor: Colors.muted,
    statusBg: Alpha.glassStrong,
    statusBorder: Alpha.hairlineSoft,
    icon: 'event_available',
    sub: 'Påskeferie',
  },
];

const ECO_SHIFTS = [
  { place: 'Novo Nordisk A/S', date: '6. maj', hours: '7,0 t', amount: '2.030 kr.' },
  { place: 'Maersk Headquarters', date: '14. maj', hours: '7,0 t', amount: '2.030 kr.' },
  { place: 'Grundfos Bjerringbro', date: '21. maj', hours: '7,0 t', amount: '2.030 kr.' },
  { place: 'LEGO Billund', date: '27. maj', hours: '7,0 t', amount: '2.030 kr.' },
];

/* --------------------------------------------------------------------- */
/* Screen                                                                 */
/* --------------------------------------------------------------------- */

export function CalendarScreen({
  initialView,
}: {
  initialView: 'month' | 'day';
}) {
  const insets = useSafeAreaInsets();
  const { openNotifications } = useNav();
  const toast = useToast();

  const [subTab, setSubTab] = useState<SubTab>('vagtplan');
  const [showDay, setShowDay] = useState(initialView === 'day');

  // Keep the day view in sync if the shell re-enters the calendar on the day view.
  useEffect(() => {
    if (initialView === 'day') {
      setSubTab('vagtplan');
      setShowDay(true);
    }
  }, [initialView]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Txt font="displayBold" size={22} color={Colors.pink}>
          Vagtplan
        </Txt>
        <View style={styles.headerActions}>
          <HeaderIconButton icon="notifications" onPress={openNotifications} />
          <HeaderIconButton
            icon="settings"
            onPress={() => toast.show('Indstillinger')}
          />
        </View>
      </View>

      <PillTabs<SubTab>
        tabs={SUB_TABS}
        selected={subTab}
        onSelect={setSubTab}
        scroll
        style={styles.subTabs}
      />

      {subTab === 'vagtplan' ? (
        showDay && initialView === 'day' ? (
          <DayProgram onBack={() => setShowDay(false)} toast={toast} />
        ) : (
          <VagtplanTab onOpenDay={() => setShowDay(true)} />
        )
      ) : null}
      {subTab === 'okonomi' ? <OkonomiTab /> : null}
      {subTab === 'fravaer' ? <FravaerTab toast={toast} /> : null}
      {subTab === 'vagtboers' ? <VagtboersTab toast={toast} /> : null}
    </ScrollView>
  );
}

/* --------------------------------------------------------------------- */
/* Vagtplan tab (month + week + shift list)                               */
/* --------------------------------------------------------------------- */

function VagtplanTab({ onOpenDay }: { onOpenDay: () => void }) {
  const { openTreatmentGuide } = useNav();
  const [mode, setMode] = useState<CalMode>('maaned');

  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const monthLabel = useMemo(() => {
    const months = [
      'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'December',
    ];
    return `${months[today.getMonth()]} ${today.getFullYear()}`;
  }, [today]);

  const cells = useMemo(() => buildMonthCells(today), [today]);
  const shiftDays = useMemo(
    () => new Set(DEMO_SHIFTS.map((s) => s.day)),
    [],
  );

  const selectedShift = DEMO_SHIFTS.find((s) => s.day === selectedDay) ?? null;

  return (
    <View style={styles.section}>
      <Txt
        font="bold"
        size={11}
        color={Colors.muted}
        tracking={2}
        uppercase
        align="center">
        {monthLabel}
      </Txt>

      {/* Uge / Måned toggle */}
      <View style={styles.modeToggleWrap}>
        <View style={styles.modeToggle}>
          {CAL_MODES.map((m) => {
            const active = m.key === mode;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[styles.modePill, active && styles.modePillActive]}>
                <Txt
                  font="bold"
                  size={12}
                  color={active ? Colors.onPink : Colors.muted}>
                  {m.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      {mode === 'maaned' ? (
        <>
          {/* Month grid */}
          <GlassCard padding={16}>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((d) => (
                <View key={d} style={styles.weekCol}>
                  <Txt font="bold" size={10} color={Colors.faint} tracking={0.5}>
                    {d}
                  </Txt>
                </View>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((cell, i) => {
                if (cell == null) {
                  return <View key={`e-${i}`} style={styles.cell} />;
                }
                const isSelected = cell === selectedDay;
                const isToday = cell === today.getDate();
                const hasShift = shiftDays.has(cell);
                return (
                  <Pressable
                    key={cell}
                    onPress={() => setSelectedDay(cell)}
                    style={[styles.cell, isSelected && styles.cellSelected]}>
                    <Txt
                      font={isSelected || isToday ? 'bold' : 'medium'}
                      size={13}
                      color={
                        isSelected
                          ? Colors.onPink
                          : isToday
                            ? Colors.pinkBright
                            : Colors.text
                      }>
                      {cell}
                    </Txt>
                    <View style={styles.dotRow}>
                      {hasShift ? (
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: isSelected
                                ? Colors.onPink
                                : Colors.pink,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Selected day detail */}
          <View>
            <View style={styles.selectedHeader}>
              <Txt font="displayBold" size={18} color={Colors.text}>
                {`${selectedDay}. ${monthLabel.split(' ')[0].toLowerCase()}`}
              </Txt>
              {selectedShift ? (
                <View style={styles.countBadge}>
                  <Txt font="bold" size={10} color={Colors.muted} tracking={0.5} uppercase>
                    1 vagt
                  </Txt>
                </View>
              ) : null}
            </View>

            {selectedShift ? (
              <GlassCard padding={16} radius={Radius.xl} style={styles.gap12}>
                <View style={styles.rowStart}>
                  <View style={styles.typePill}>
                    <Icon name="event_available" size={14} color={Colors.pink} />
                    <Txt
                      font="bold"
                      size={10}
                      color={Colors.pink}
                      tracking={0.6}
                      uppercase>
                      Vagt
                    </Txt>
                  </View>
                </View>
                <View>
                  <Txt
                    font="display"
                    size={16}
                    color={Colors.text}
                    style={styles.mb8}>
                    {selectedShift.account}
                  </Txt>
                  <DetailRow icon="location_on" text={selectedShift.location} />
                  <DetailRow icon="schedule" text={selectedShift.time} bold />
                  <DetailRow icon="coffee" text={`Pause: ${selectedShift.pause}`} />
                  <Pressable
                    onPress={() => openTreatmentGuide()}
                    style={styles.guideLink}>
                    <Txt
                      font="bold"
                      size={10}
                      color={Colors.pink}
                      tracking={0.6}
                      uppercase>
                      Behandlervejledning
                    </Txt>
                    <Icon name="arrow_forward" size={14} color={Colors.pink} />
                  </Pressable>
                </View>
                <Pressable onPress={onOpenDay} style={styles.outlineWide}>
                  <Icon name="event_note" size={18} color={Colors.pink} />
                  <Txt font="bold" size={14} color={Colors.text}>
                    Se dagens aftaler
                  </Txt>
                </Pressable>
              </GlassCard>
            ) : (
              <View style={styles.emptyCard}>
                <Icon name="event_available" size={28} color={Colors.faint} />
                <Txt font="regular" size={13} color={Colors.muted} align="center">
                  Ingen vagter eller markeringer denne dag.
                </Txt>
              </View>
            )}
          </View>
        </>
      ) : (
        <WeekOverview onOpenDay={onOpenDay} />
      )}

      {/* Shift list */}
      <View style={styles.gap10}>
        <Txt font="displayBold" size={18} color={Colors.text}>
          Kommende vagter
        </Txt>
        {DEMO_SHIFTS.map((s) => (
          <ShiftCard key={s.day} shift={s} onPress={() => setSelectedDay(s.day)} />
        ))}
      </View>
    </View>
  );
}

function WeekOverview({ onOpenDay }: { onOpenDay: () => void }) {
  return (
    <View style={styles.gap16}>
      <GlassCard
        padding={18}
        gradient={['#3b41ca', '#2b31a6', '#20267e']}
        borderColor={Alpha.hairline}>
        <View style={styles.rowStartGap}>
          <Icon name="date_range" size={20} color={Colors.white} />
          <Txt font="display" size={17} color={Colors.white}>
            Din uge — overblik
          </Txt>
        </View>
        <Txt
          font="regular"
          size={13}
          color="rgba(255,255,255,0.8)"
          style={styles.mt4}>
          Aktiviteter de næste 7 dage
        </Txt>
        <View style={styles.weekStatRow}>
          <View style={styles.weekStat}>
            <Txt font="displayExtrabold" size={22} color={Colors.white}>
              3
            </Txt>
            <Txt font="regular" size={11} color="rgba(255,255,255,0.75)">
              Vagter
            </Txt>
          </View>
          <View style={styles.weekStat}>
            <Txt font="displayExtrabold" size={22} color={Colors.white}>
              1
            </Txt>
            <Txt font="regular" size={11} color="rgba(255,255,255,0.75)">
              Møder
            </Txt>
          </View>
        </View>
      </GlassCard>

      <View style={styles.gap10}>
        {DEMO_SHIFTS.slice(0, 3).map((s) => (
          <ShiftCard key={s.day} shift={s} onPress={onOpenDay} />
        ))}
      </View>
    </View>
  );
}

function ShiftCard({
  shift,
  onPress,
}: {
  shift: DemoShift;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard padding={14} radius={Radius.md}>
        <View style={styles.shiftRow}>
          <View style={styles.shiftIcon}>
            <Icon name="event_available" size={19} color={Colors.pink} />
          </View>
          <View style={styles.flex}>
            <Txt font="bold" size={14} color={Colors.text} numberOfLines={1}>
              {shift.account}
            </Txt>
            <Txt font="regular" size={11.5} color={Colors.muted} style={styles.mt2}>
              {shift.time} · {shift.location}
            </Txt>
          </View>
          <Icon name="chevron_right" size={20} color={Colors.muted} />
        </View>
      </GlassCard>
    </Pressable>
  );
}

/* --------------------------------------------------------------------- */
/* Day view ("Dagens program") — wired to the API                        */
/* --------------------------------------------------------------------- */

function DayProgram({
  onBack,
  toast,
}: {
  onBack: () => void;
  toast: ReturnType<typeof useToast>;
}) {
  const { token, signOut } = useAuth();
  const { openTreatmentGuide } = useNav();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<SpecificDayBooking[] | null>(null);
  const [fallback, setFallback] = useState<DemoBooking[] | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSpecificDayBookings(token!, new Date())
      .then((data) => {
        if (!active) return;
        setBookings(data);
        setFallback(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.isUnauthorized) {
          signOut('Din session er udløbet. Log ind igen.');
          return;
        }
        // Other errors: fall back to demo data so the screen stays complete.
        setBookings(null);
        setFallback(DEMO_PROGRAM);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, signOut]);

  const headerSub = useMemo(() => {
    const d = new Date();
    const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const months = [
      'januar', 'februar', 'marts', 'april', 'maj', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'december',
    ];
    const label = `${days[d.getDay()]} ${d.getDate()}. ${months[d.getMonth()]}`;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, []);

  const hasApiBookings = bookings != null && bookings.length > 0;
  const showEmpty = bookings != null && bookings.length === 0;

  return (
    <View style={styles.section}>
      <View style={styles.dayHeader}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow_back" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.flex}>
          <Txt font="displayBold" size={19} color={Colors.text}>
            Dagens program
          </Txt>
          <Txt font="regular" size={12} color={Colors.muted} style={styles.mt2}>
            {headerSub}
          </Txt>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.pink} />
          <Txt font="regular" size={13} color={Colors.muted} style={styles.mt8}>
            Henter dagens program…
          </Txt>
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyCard}>
          <Icon name="event_available" size={28} color={Colors.faint} />
          <Txt font="regular" size={13} color={Colors.muted} align="center">
            Der er ingen bookinger på dagens program endnu.
          </Txt>
        </View>
      ) : (
        <View style={styles.gap10}>
          {hasApiBookings
            ? bookings!.map((b) => (
                <TimelineItem
                  key={b.bookingId}
                  time={formatTime(b.start)}
                  title={b.contactName}
                  service={b.serviceType}
                  status={b.displayStatus}
                  statusColor={
                    b.isCompleted
                      ? Colors.success
                      : b.isActive
                        ? Colors.success
                        : Colors.muted
                  }
                  active={b.isActive}
                  onJournal={() => toast.show('Åbner journal & noter')}
                  onGuide={() => openTreatmentGuide()}
                  onDone={() => toast.show('Markeret som gennemført')}
                  onAbsent={() => toast.show('Markeret som udeblevet')}
                />
              ))
            : (fallback ?? []).map((b, i) => (
                <TimelineItem
                  key={`demo-${i}`}
                  time={b.time}
                  title={b.title}
                  service={b.service}
                  status={b.status}
                  statusColor={b.statusColor}
                  active={b.active}
                  onJournal={() => toast.show('Åbner journal & noter')}
                  onGuide={() => openTreatmentGuide()}
                  onDone={() => toast.show('Markeret som gennemført')}
                  onAbsent={() => toast.show('Markeret som udeblevet')}
                />
              ))}
        </View>
      )}
    </View>
  );
}

function TimelineItem({
  time,
  title,
  service,
  status,
  statusColor,
  active,
  onJournal,
  onGuide,
  onDone,
  onAbsent,
}: {
  time: string;
  title: string;
  service: string;
  status: string;
  statusColor: string;
  active: boolean;
  onJournal: () => void;
  onGuide: () => void;
  onDone: () => void;
  onAbsent: () => void;
}) {
  const [open, setOpen] = useState(active);
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineGutter}>
        <Txt
          font="bold"
          size={11}
          color={active ? Colors.success : Colors.muted}>
          {time}
        </Txt>
        <View style={styles.timelineLine} />
      </View>
      <GlassCard
        padding={0}
        radius={Radius.lg}
        backgroundColor={active ? Alpha.pinkTint : Alpha.glass}
        style={styles.timelineCard}>
        <View style={styles.timelineHead}>
          <View style={styles.timelineIcon}>
            <Icon name="person" size={20} color={active ? Colors.success : Colors.pink} />
          </View>
          <View style={styles.flex}>
            <Txt font="bold" size={15} color={Colors.text} numberOfLines={1}>
              {title}
            </Txt>
            <Txt font="regular" size={12} color={Colors.muted} style={styles.mt2}>
              {service}
            </Txt>
          </View>
          <StatusPill
            label={status}
            color={statusColor}
            background="rgba(255,255,255,0.04)"
            borderColor={Alpha.hairlineSoft}
          />
          <Pressable onPress={() => setOpen((o) => !o)} hitSlop={8}>
            <Icon
              name={open ? 'expand_less' : 'expand_more'}
              size={22}
              color={Colors.muted}
            />
          </Pressable>
        </View>

        {open ? (
          <View style={styles.timelineBody}>
            <Pressable onPress={onJournal} style={styles.pinkWide}>
              <Icon name="book" size={18} color={Colors.onPink} />
              <Txt font="bold" size={14} color={Colors.onPink}>
                Åben journal & noter
              </Txt>
            </Pressable>
            <View style={styles.actionGrid}>
              <Pressable onPress={onDone} style={styles.actionBtn}>
                <Icon name="check" size={18} color={Colors.success} />
                <Txt font="bold" size={11} color={Colors.success} uppercase>
                  Gennemført
                </Txt>
              </Pressable>
              <Pressable onPress={onAbsent} style={styles.actionBtn}>
                <Icon name="person_off" size={18} color={Colors.warning} />
                <Txt font="bold" size={11} color={Colors.warning} uppercase>
                  Udeblevet
                </Txt>
              </Pressable>
            </View>
            <Pressable onPress={onGuide} style={styles.guideLink}>
              <Txt font="bold" size={10} color={Colors.pink} tracking={0.6} uppercase>
                Behandlervejledning
              </Txt>
              <Icon name="arrow_forward" size={14} color={Colors.pink} />
            </Pressable>
          </View>
        ) : null}
      </GlassCard>
    </View>
  );
}

/* --------------------------------------------------------------------- */
/* Økonomi tab                                                            */
/* --------------------------------------------------------------------- */

function OkonomiTab() {
  return (
    <View style={styles.section}>
      <GlassCard
        padding={18}
        gradient={['#3b41ca', '#262d9c', '#1a2078']}
        borderColor="rgba(255,255,255,0.18)">
        <Txt font="regular" size={14} color="rgba(243,244,255,0.92)">
          Forventet kommende{' '}
          <Txt font="bold" size={14} color="rgba(243,244,255,0.92)">
            Lønudbetaling
          </Txt>
        </Txt>
        <Txt font="displayExtrabold" size={24} color={Colors.pink} style={styles.mt6}>
          14.145 kr.{' '}
          <Txt font="display" size={14} color="rgba(243,244,255,0.85)">
            brutto
          </Txt>
        </Txt>
        <Txt font="regular" size={12} color={Colors.muted} style={styles.mt8}>
          Næste lønudbetaling sker den 29. maj 2026
        </Txt>
      </GlassCard>

      <GlassCard padding={18}>
        <View style={styles.ecoSummary}>
          <View style={styles.ecoSummaryHead}>
            <View>
              <Txt font="bold" size={10} color={Colors.muted} tracking={0.5} uppercase>
                Lønperiode
              </Txt>
              <Txt font="regular" size={12} color={Colors.text} style={styles.mt2}>
                11. apr – 10. maj
              </Txt>
            </View>
            <Txt font="bold" size={20} color={Colors.pink}>
              142,5 t
            </Txt>
          </View>
          <View style={styles.ecoTrack}>
            <View style={[styles.ecoFill, { width: '89%' }]} />
          </View>
        </View>
      </GlassCard>

      <GlassCard padding={18} style={styles.gap14}>
        <View style={styles.rowStartGap}>
          <Txt font="display" size={17} color={Colors.text} style={styles.flex}>
            Vagter i perioden
          </Txt>
          <Icon name="download" size={22} color={Colors.muted} />
        </View>
        <View>
          {ECO_SHIFTS.map((s, i) => (
            <View
              key={`${s.place}-${i}`}
              style={[styles.ecoShiftRow, i > 0 && styles.topBorder]}>
              <View style={styles.flex}>
                <Txt font="semibold" size={14} color={Colors.text}>
                  {s.place}
                </Txt>
                <Txt font="regular" size={11} color={Colors.muted} style={styles.mt2}>
                  {s.date} · {s.hours}
                </Txt>
              </View>
              <Txt font="bold" size={14} color={Colors.text}>
                {s.amount}
              </Txt>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

/* --------------------------------------------------------------------- */
/* Fravær tab                                                             */
/* --------------------------------------------------------------------- */

function FravaerTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [syg, setSyg] = useState(false);
  const [ferieOpen, setFerieOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const sendFerie = () => {
    setFerieOpen(false);
    setFrom('');
    setTo('');
    toast.show('Ferieanmodning sendt');
  };

  return (
    <View style={styles.section}>
      {/* Sygdom toggle */}
      <Pressable onPress={() => setSyg((s) => !s)}>
        <GlassCard padding={20} radius={Radius.xl} style={styles.sygCard}>
          <View
            style={[
              styles.sygIcon,
              { backgroundColor: syg ? Alpha.dangerTint : Alpha.glassStrong },
            ]}>
            <Icon
              name={syg ? 'sick' : 'healing'}
              size={24}
              color={syg ? Colors.danger : Colors.muted}
            />
          </View>
          <Txt font="bold" size={14} color={Colors.text}>
            {syg ? 'Sygemeldt i dag' : 'Meld dig syg'}
          </Txt>
          <Toggle value={syg} onChange={setSyg} />
        </GlassCard>
      </Pressable>

      {/* Ferie */}
      <View style={styles.gap14}>
        <View style={styles.rowStartGap}>
          <View style={styles.rowStartGapInner}>
            <Icon name="beach_access" size={22} color={Colors.lilac} />
            <Txt font="display" size={18} color={Colors.text}>
              Ferie
            </Txt>
          </View>
          {!ferieOpen ? (
            <Pressable onPress={() => setFerieOpen(true)} style={styles.smallPink}>
              <Icon name="add" size={18} color={Colors.onPink} />
              <Txt font="bold" size={13} color={Colors.onPink}>
                Anmod
              </Txt>
            </Pressable>
          ) : null}
        </View>

        {ferieOpen ? (
          <GlassCard padding={18} borderColor={Alpha.pinkBorder} style={styles.gap16}>
            <Txt font="display" size={15} color={Colors.text}>
              Ny ferieanmodning
            </Txt>
            <View style={styles.inputGrid}>
              <LabeledInput
                label="Start dato"
                value={from}
                onChangeText={setFrom}
                placeholder="dd.mm.åååå"
              />
              <LabeledInput
                label="Slut dato"
                value={to}
                onChangeText={setTo}
                placeholder="dd.mm.åååå"
              />
            </View>
            <View style={styles.formButtons}>
              <Pressable onPress={sendFerie} style={[styles.pinkSmall, styles.flex]}>
                <Txt font="bold" size={13} color={Colors.onPink}>
                  Send anmodning
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => setFerieOpen(false)}
                style={[styles.ghostSmall, styles.flex]}>
                <Txt font="bold" size={13} color={Colors.text}>
                  Fortryd
                </Txt>
              </Pressable>
            </View>
          </GlassCard>
        ) : null}

        <Txt
          font="bold"
          size={11}
          color={Colors.muted}
          tracking={2}
          uppercase
          style={styles.mt4}>
          Kommende
        </Txt>
        {FERIE_KOMMENDE.map((f, i) => (
          <FerieCard key={`k-${i}`} entry={f} />
        ))}

        <Txt
          font="bold"
          size={11}
          color={Colors.muted}
          tracking={2}
          uppercase
          style={styles.mt8}>
          Afviklede
        </Txt>
        {FERIE_AFVIKLET.map((f, i) => (
          <FerieCard key={`a-${i}`} entry={f} faded />
        ))}
      </View>
    </View>
  );
}

function FerieCard({ entry, faded }: { entry: FerieEntry; faded?: boolean }) {
  return (
    <GlassCard
      padding={16}
      radius={Radius.lg}
      backgroundColor={faded ? 'rgba(13,19,64,0.35)' : Alpha.glass}
      borderColor={faded ? Alpha.divider : Alpha.hairlineSoft}
      style={[styles.gap10, faded && styles.faded]}>
      <View style={styles.rowStartGap}>
        <View style={styles.flex}>
          <Txt font="display" size={15} color={faded ? '#cdd1f0' : Colors.text}>
            {entry.period}
          </Txt>
          <Txt font="regular" size={12} color={Colors.muted} style={styles.mt4}>
            {entry.days}
          </Txt>
        </View>
        <StatusPill
          label={entry.status}
          color={entry.statusColor}
          background={entry.statusBg}
          borderColor={entry.statusBorder}
        />
      </View>
      {!faded ? (
        <View style={[styles.rowStartGapInner, styles.topBorderPad]}>
          <Icon name="info" size={15} color={Colors.faint} />
          <Txt font="regular" size={12} color={Colors.muted} style={styles.flex}>
            {entry.sub}
          </Txt>
        </View>
      ) : null}
    </GlassCard>
  );
}

/* --------------------------------------------------------------------- */
/* Vagtbørs tab                                                           */
/* --------------------------------------------------------------------- */

function VagtboersTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [distance, setDistance] = useState('50');
  const [openBid, setOpenBid] = useState<string | null>(null);

  const resetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setTimeFrom('');
    setTimeTo('');
    setDistance('50');
  };

  return (
    <View style={styles.section}>
      {/* Meld ledig tid */}
      <Pressable onPress={() => toast.show('Meld ledig tid')}>
        <GlassCard padding={20} radius={Radius.xl} style={styles.meldCard}>
          <View style={styles.sygIcon}>
            <Icon name="add_circle" size={24} color={Colors.pink} />
          </View>
          <Txt font="bold" size={14} color={Colors.text}>
            Meld ledig tid
          </Txt>
          <Txt font="regular" size={12} color={Colors.muted} align="center">
            Ingen af nedenstående vagter der passer? Meld ledig tid ind her, så vi kan
            matche vagter med hvornår du kan.
          </Txt>
        </GlassCard>
      </Pressable>

      <View style={styles.rowStartGap}>
        <Txt font="display" size={18} color={Colors.text} style={styles.flex}>
          Hjælp en kollega
        </Txt>
        <Txt font="bold" size={11} color={Colors.muted}>
          {DEMO_OFFERS.length} vagter
        </Txt>
      </View>

      {/* Collapsible filter card */}
      <GlassCard padding={16} radius={Radius.xl} style={styles.gap14}>
        <Pressable
          onPress={() => setFilterOpen((o) => !o)}
          style={styles.rowStartGap}>
          <Txt
            font="bold"
            size={12}
            color={Colors.muted}
            tracking={1}
            uppercase
            style={styles.flex}>
            Filtrér vagter
          </Txt>
          <Icon
            name={filterOpen ? 'expand_less' : 'expand_more'}
            size={22}
            color={Colors.muted}
          />
        </Pressable>

        {filterOpen ? (
          <View style={styles.gap14}>
            <View>
              <FieldLabel>Dato</FieldLabel>
              <View style={styles.inputGrid}>
                <PillInput value={dateFrom} onChangeText={setDateFrom} placeholder="Fra" />
                <PillInput value={dateTo} onChangeText={setDateTo} placeholder="Til" />
              </View>
            </View>
            <View>
              <FieldLabel>Tidspunkt</FieldLabel>
              <View style={styles.inputGrid}>
                <PillInput value={timeFrom} onChangeText={setTimeFrom} placeholder="08:00" />
                <PillInput value={timeTo} onChangeText={setTimeTo} placeholder="16:00" />
              </View>
            </View>
            <View>
              <View style={styles.rowStartGap}>
                <FieldLabel style={styles.flex}>Maks. afstand</FieldLabel>
                <Txt font="bold" size={12} color={Colors.pink}>
                  {distance} km
                </Txt>
              </View>
              <PillInput
                value={distance}
                onChangeText={setDistance}
                placeholder="50"
                keyboardType="number-pad"
              />
            </View>
            <Pressable onPress={resetFilter} style={styles.resetBtn}>
              <Txt font="bold" size={11} color={Colors.pink}>
                Nulstil
              </Txt>
            </Pressable>
          </View>
        ) : null}
      </GlassCard>

      {/* Offer list */}
      <View style={styles.gap12}>
        {DEMO_OFFERS.map((o) => (
          <OfferCard
            key={o.id}
            offer={o}
            bidOpen={openBid === o.id}
            onToggleBid={() => setOpenBid((cur) => (cur === o.id ? null : o.id))}
            onSendBid={() => {
              setOpenBid(null);
              toast.show('Dit bud er sendt');
            }}
            onAdjust={() => toast.show('Juster bud')}
          />
        ))}
      </View>
    </View>
  );
}

function OfferCard({
  offer,
  bidOpen,
  onToggleBid,
  onSendBid,
  onAdjust,
}: {
  offer: Offer;
  bidOpen: boolean;
  onToggleBid: () => void;
  onSendBid: () => void;
  onAdjust: () => void;
}) {
  const [bidDate, setBidDate] = useState('');
  const [bidStart, setBidStart] = useState('08:00');
  const [bidEnd, setBidEnd] = useState('15:00');

  return (
    <GlassCard padding={16} radius={Radius.xl} style={styles.gap12}>
      <View>
        <Txt font="regular" size={12} color={Colors.muted}>
          {offer.period}
        </Txt>
        <Txt font="bold" size={14} color={Colors.text} style={styles.mt4}>
          {offer.place}
        </Txt>
        <View style={[styles.rowStartGapInner, styles.mt8]}>
          <Icon name={offer.roomIcon} size={16} color={Colors.lilac} />
          <Txt font="regular" size={12} color={Colors.text}>
            {offer.room}
          </Txt>
        </View>
        {offer.bonus ? (
          <Txt font="regular" size={12} color={Colors.pink} style={styles.mt8}>
            {offer.bonus}
          </Txt>
        ) : null}
        {offer.desc ? (
          <Txt
            font="regular"
            size={12.5}
            color={Colors.muted}
            lineHeight={18}
            style={styles.mt10}>
            {offer.desc}
          </Txt>
        ) : null}
      </View>

      <View style={styles.offerButtons}>
        {offer.justerable ? (
          <Pressable onPress={onAdjust} style={[styles.justerBtn, styles.flex]}>
            <Txt font="bold" size={12} color={Colors.pink}>
              Juster
            </Txt>
          </Pressable>
        ) : null}
        <Pressable onPress={onToggleBid} style={[styles.bidBtn, styles.flex]}>
          <Txt font="bold" size={12} color={Colors.text}>
            Byd ind
          </Txt>
        </Pressable>
      </View>

      {bidOpen ? (
        <View style={styles.bidForm}>
          <Txt font="display" size={14} color={Colors.text}>
            Byd på vagt
          </Txt>
          <LabeledInput
            label="Vælg dato"
            value={bidDate}
            onChangeText={setBidDate}
            placeholder="dd.mm.åååå"
          />
          <View style={styles.inputGrid}>
            <LabeledInput label="Start" value={bidStart} onChangeText={setBidStart} />
            <LabeledInput label="Slut" value={bidEnd} onChangeText={setBidEnd} />
          </View>
          <View style={styles.formButtons}>
            <Pressable onPress={onSendBid} style={[styles.pinkSmall, styles.flex]}>
              <Txt font="bold" size={13} color={Colors.onPink}>
                Send bud
              </Txt>
            </Pressable>
            <Pressable onPress={onToggleBid} style={[styles.ghostSmall, styles.flex]}>
              <Txt font="bold" size={13} color={Colors.text}>
                Annuller
              </Txt>
            </Pressable>
          </View>
        </View>
      ) : null}
    </GlassCard>
  );
}

/* --------------------------------------------------------------------- */
/* Small shared pieces                                                    */
/* --------------------------------------------------------------------- */

function DetailRow({
  icon,
  text,
  bold,
}: {
  icon: string;
  text: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={16} color={Colors.lilac} />
      <Txt font={bold ? 'bold' : 'regular'} size={12} color={Colors.text} style={styles.flex}>
        {text}
      </Txt>
    </View>
  );
}

function FieldLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Txt
      font="bold"
      size={10}
      color={Colors.muted}
      tracking={0.5}
      uppercase
      style={[styles.fieldLabel, style]}>
      {children}
    </Txt>
  );
}

function PillInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.faint}
      keyboardType={keyboardType}
      style={styles.pillInput}
    />
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={[styles.flex, styles.gap6]}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.faint}
        style={styles.pillInput}
      />
    </View>
  );
}

/* --------------------------------------------------------------------- */
/* Month grid helper                                                      */
/* --------------------------------------------------------------------- */

/** Build a Mon-first month grid; null entries are leading/trailing blanks. */
function buildMonthCells(ref: Date): (number | null)[] {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const first = new Date(year, month, 1);
  // JS getDay(): 0 = Sun. Convert to Mon-first index (0 = Mon … 6 = Sun).
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* --------------------------------------------------------------------- */
/* Styles                                                                 */
/* --------------------------------------------------------------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: 20, gap: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subTabs: { paddingVertical: 2 },

  section: { gap: 20 },

  // Uge/Måned toggle
  modeToggleWrap: { alignItems: 'center' },
  modeToggle: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(13,19,64,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modePill: {
    paddingVertical: 7,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
  },
  modePillActive: { backgroundColor: Colors.pink },

  // Month grid
  weekRow: { flexDirection: 'row', marginBottom: 10 },
  weekCol: { flex: 1, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    gap: 2,
  },
  cellSelected: { backgroundColor: Colors.pink },
  dotRow: { height: 6, flexDirection: 'row', alignItems: 'center', gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  // Selected day detail
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(214,51,224,0.3)',
    backgroundColor: 'rgba(217,74,230,0.08)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  outlineWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(13,19,64,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },

  // Week overview
  weekStatRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  weekStat: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },

  // Shift card
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shiftIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
  },

  // Day program
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { alignItems: 'center', paddingVertical: 48 },

  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineGutter: { width: 44, alignItems: 'center', paddingTop: 6 },
  timelineLine: {
    width: 1,
    flex: 1,
    marginVertical: 6,
    backgroundColor: 'rgba(160,172,255,0.2)',
  },
  timelineCard: { flex: 1, marginBottom: 4 },
  timelineHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  timelineIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timelineBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Alpha.divider,
    gap: 12,
    paddingTop: 12,
  },
  pinkWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pink,
    paddingVertical: 11,
  },
  actionGrid: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Økonomi
  ecoSummary: {
    borderRadius: Radius.md,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Alpha.divider,
  },
  ecoSummaryHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  ecoTrack: {
    width: '100%',
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Alpha.track,
    overflow: 'hidden',
  },
  ecoFill: { height: '100%', backgroundColor: Colors.pink },
  ecoShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },

  // Fravær
  sygCard: { alignItems: 'center', gap: 10 },
  sygIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217,74,230,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  faded: { opacity: 0.85 },

  // Vagtbørs
  meldCard: { alignItems: 'center', gap: 8 },
  resetBtn: { alignSelf: 'flex-start' },
  offerButtons: { flexDirection: 'row', gap: 8 },
  justerBtn: {
    borderWidth: 1,
    borderColor: Colors.pink,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderRadius: Radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
  },
  bidBtn: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: Radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
  },
  bidForm: {
    borderTopWidth: 1,
    borderTopColor: Alpha.hairlineSoft,
    paddingTop: 14,
    gap: 12,
  },

  // Inputs / forms
  inputGrid: { flexDirection: 'row', gap: 10 },
  fieldLabel: { marginBottom: 6 },
  pillInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: 'rgba(160,172,255,0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
  },
  formButtons: { flexDirection: 'row', gap: 10 },
  pinkSmall: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingVertical: 11,
    alignItems: 'center',
  },
  ghostSmall: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.pill,
    paddingVertical: 11,
    alignItems: 'center',
  },

  // Generic
  flex: { flex: 1 },
  rowStart: { flexDirection: 'row', alignItems: 'center' },
  rowStartGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowStartGapInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBorder: { borderTopWidth: 1, borderTopColor: Alpha.divider },
  topBorderPad: {
    borderTopWidth: 1,
    borderTopColor: Alpha.divider,
    paddingTop: 10,
  },
  gap6: { gap: 6 },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
  gap14: { gap: 14 },
  gap16: { gap: 16 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mb8: { marginBottom: 8 },
});
