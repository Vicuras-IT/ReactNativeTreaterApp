import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ArrowLink,
  Avatar,
  Divider,
  GlassCard,
  HeaderIconButton,
  Icon,
  PinkButton,
  StatusPill,
  Txt,
  useToast,
} from '@/components/ui';
import { useNav } from '@/state/navigation-context';
import { useUser } from '@/state/user-context';
import { Alpha, Colors, RequestGradient } from '@/theme';

/* ------------------------------------------------------------------ */
/*  Local theme constants matching the design HTML exactly             */
/* ------------------------------------------------------------------ */

const REQUEST_GRADIENT = RequestGradient.colors;
const SHIFT_GRADIENT = ['#333BC4', '#262D9C', '#1A2078'] as const;
const PANEL_GRADIENT = ['#1C1E80', '#14155F'] as const;
const WHITE_70 = 'rgba(255,255,255,0.7)';
const WHITE_80 = 'rgba(255,255,255,0.8)';
const WHITE_85 = 'rgba(255,255,255,0.85)';
const WHITE_90 = 'rgba(255,255,255,0.9)';
const WHITE_92 = 'rgba(255,255,255,0.92)';
const WHITE_60 = 'rgba(255,255,255,0.6)';
const CARD_GAP = 28;

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const nav = useNav();
  const toast = useToast();

  const fullName = profile?.fullName ?? 'Lars Holm';
  const initials = profile?.initials ?? 'LH';
  const picture = profile?.pictureBase64;

  return (
    <ScrollView
      style={styles.flex}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      {/* Top bar */}
      <View style={styles.header}>
        <Txt font="displayExtrabold" size={22} color={Colors.pink}>
          Vicuras
        </Txt>
        <View style={styles.headerActions}>
          <HeaderIconButton
            icon="notifications"
            badge={4}
            onPress={nav.openNotifications}
          />
          <Pressable
            onPress={() => nav.setTab('profile')}
            hitSlop={6}
            style={({ pressed }) => pressed && styles.dim}>
            <Avatar
              initials={initials}
              pictureBase64={picture}
              size={36}
              fontSize={12}
            />
          </Pressable>
        </View>
      </View>

      {/* Greeting */}
      <View>
        <Txt font="regular" size={15} color={Colors.muted}>
          Godt at se dig igen,
        </Txt>
        <Txt
          font="displayExtrabold"
          size={34}
          color={Colors.text}
          lineHeight={36}
          style={styles.greetingName}>
          {fullName}
        </Txt>
        <LinearGradient
          colors={['#C81FD4', '#D633E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.greetingUnderline}
        />
      </View>

      {/* Birthday greeting */}
      <BirthdayCard />

      {/* Notifications carousel */}
      <NotificationsCarousel toast={toast} />

      {/* Næste arbejdsdag */}
      <NextWorkdayCard nav={nav} />

      {/* Dagens program */}
      <TodaysProgram onOpen={nav.openTodaysProgram} toast={toast} />

      {/* Mit overblik */}
      <MyOverview onProfile={() => nav.setTab('profile')} toast={toast} />

      {/* Hurtig adgang */}
      <QuickAccess nav={nav} />

      {/* Seneste nyt */}
      <LatestNews toast={toast} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading (uppercase label + accent bar)                     */
/* ------------------------------------------------------------------ */

function SectionHeading({
  label,
  trailing,
  accentBar,
}: {
  label: string;
  trailing?: ReactNode;
  accentBar?: boolean;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Txt font="bold" size={12} color={Colors.muted} tracking={2.2} uppercase>
        {label}
      </Txt>
      {accentBar ? (
        <LinearGradient
          colors={['#C81FD4', '#D633E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headingBar}
        />
      ) : (
        trailing
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Birthday card                                                      */
/* ------------------------------------------------------------------ */

function BirthdayCard() {
  return (
    <LinearGradient
      colors={REQUEST_GRADIENT}
      locations={RequestGradient.locations}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.birthdayCard}>
      <View style={styles.birthdayIcon}>
        <Icon name="cake" size={30} color={Colors.white} />
      </View>
      <View style={styles.flexShrink}>
        <Txt font="displayExtrabold" size={18} color={Colors.white} lineHeight={21}>
          Tillykke med fødselsdagen! 🎉
        </Txt>
        <Txt
          font="regular"
          size={13}
          color={WHITE_90}
          lineHeight={20}
          style={styles.mt6}>
          Hele Vicuras-holdet ønsker dig en dejlig dag. Tak for din indsats — vi
          sætter stor pris på dig!
        </Txt>
      </View>
    </LinearGradient>
  );
}

/* ------------------------------------------------------------------ */
/*  Notifications carousel                                             */
/* ------------------------------------------------------------------ */

type ToastApi = ReturnType<typeof useToast>;

function NotificationsCarousel({ toast }: { toast: ToastApi }) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  // Cards span 89% of the available content width (screen minus 20px gutters).
  const contentWidth = width - 40;
  const cardWidth = Math.round(contentWidth * 0.89);
  const slideWidth = cardWidth + 10; // includes 5px padding either side

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next !== page) setPage(next);
  };

  const slides = [
    <ShiftRequestSlide key="req" toast={toast} />,
    <OnCallSlide key="oncall" toast={toast} />,
    <SummerPartySlide key="fest" toast={toast} />,
    <EducationSlide key="edu" toast={toast} />,
    <SurveySlide key="survey" toast={toast} />,
  ];

  return (
    <View>
      <View style={styles.sectionHeading}>
        <Txt font="bold" size={12} color={Colors.muted} tracking={2.2} uppercase>
          Notifikationer
        </Txt>
        <View style={styles.swipeHint}>
          <Icon name="swipe" size={16} color={Colors.pink} />
          <Txt font="bold" size={11} color={Colors.muted}>
            Stryg for flere
          </Txt>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}>
        {slides.map((slide, i) => (
          <View key={i} style={{ width: cardWidth, marginHorizontal: 5 }}>
            {slide}
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <Pressable
            key={i}
            onPress={() =>
              scrollRef.current?.scrollTo({ x: slideWidth * i, animated: true })
            }
            style={[
              styles.dot,
              {
                width: i === page ? 22 : 8,
                backgroundColor: i === page ? Colors.pink : Alpha.track,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/** Shared shell for every request card (pink gradient). */
function RequestCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <LinearGradient
      colors={REQUEST_GRADIENT}
      locations={RequestGradient.locations}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestIcon}>
          <Icon name={icon} size={20} color={Colors.white} />
        </View>
        <Txt
          font="displayBold"
          size={18}
          color={Colors.white}
          style={styles.flexShrink}>
          {title}
        </Txt>
      </View>
      {children}
    </LinearGradient>
  );
}

/** Label + value detail row used inside request cards. */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label?: string;
  value: ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={WHITE_70} style={styles.detailIcon} />
      <View style={styles.flexShrink}>
        {label ? (
          <Txt
            font="bold"
            size={10}
            color={WHITE_60}
            tracking={0.6}
            uppercase>
            {label}
          </Txt>
        ) : null}
        {typeof value === 'string' ? (
          <Txt font="semibold" size={13} color={Colors.white}>
            {value}
          </Txt>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

/** White pill CTA used on the pink request cards. */
function LightButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.lightBtn, pressed && styles.dim]}>
      {icon ? <Icon name={icon} size={19} color={Colors.pinkDeep} /> : null}
      <Txt font="bold" size={15} color={Colors.pinkDeep}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Translucent outline pill used on the pink request cards. */
function GhostButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, style, pressed && styles.dim]}>
      <Txt font="semibold" size={14} color={Colors.white}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Confirmation state shown after a request action. */
function RequestDone({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.requestDone}>
      <Icon name={icon} size={44} color={Colors.white} />
      <Txt font="bold" size={16} color={Colors.white} align="center">
        {title}
      </Txt>
      <Txt
        font="regular"
        size={13}
        color={WHITE_80}
        align="center"
        lineHeight={20}>
        {body}
      </Txt>
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.mt8}>
          <Txt
            font="semibold"
            size={13}
            color={WHITE_90}
            style={styles.underline}>
            {actionLabel}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

type ReqState = 'pending' | 'done';

function ShiftRequestSlide({ toast }: { toast: ToastApi }) {
  const [state, setState] = useState<ReqState>('pending');
  const [done, setDone] = useState({ title: '', body: '' });

  if (state === 'done') {
    return (
      <RequestCard icon="event_available" title="Klar til en ekstra vagt?">
        <RequestDone
          icon="check_circle"
          title={done.title}
          body={done.body}
          actionLabel="Luk"
          onAction={() => setState('pending')}
        />
      </RequestCard>
    );
  }

  return (
    <RequestCard icon="event_available" title="Klar til en ekstra vagt?">
      <View style={styles.detailGroup}>
        <DetailRow
          icon="location_on"
          label="Novo Nordisk"
          value="Bagsværd 8S"
        />
        <View style={styles.detailGrid}>
          <View style={styles.flex}>
            <DetailRow icon="calendar_today" label="Dato" value="24. december" />
          </View>
          <View style={styles.flex}>
            <DetailRow icon="schedule" label="Tid" value="08:00 – 09:00" />
          </View>
        </View>
        <DetailRow icon="coffee" label="Pause" value="12:00 – 12:30" />
      </View>

      <LightButton
        label="Acceptér"
        onPress={() => {
          toast.show('Vagt accepteret');
          setDone({
            title: 'Vagt accepteret',
            body: 'Vagten d. 24. december er nu tilføjet din vagtplan.',
          });
          setState('done');
        }}
      />
      <View style={styles.twinRow}>
        <GhostButton
          label="Juster"
          style={styles.flex}
          onPress={() => {
            toast.show('Justering sendt');
            setDone({
              title: 'Anmodning sendt',
              body: 'Vi har modtaget dine ønskede ændringer for d. 24. december.',
            });
            setState('done');
          }}
        />
        <GhostButton
          label="Afvis"
          style={styles.flex}
          onPress={() => {
            toast.show('Vagt afvist');
            setDone({
              title: 'Vagt afvist',
              body: 'Tak for svaret. Vagten tilbydes nu en anden behandler.',
            });
            setState('done');
          }}
        />
      </View>
    </RequestCard>
  );
}

function OnCallSlide({ toast }: { toast: ToastApi }) {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <RequestCard icon="assignment_ind" title="Tildelt rådighedsvagt">
        <RequestDone
          icon="check_circle"
          title="Rådighedsvagt bekræftet"
          body="Vagten d. 21. december fremgår nu af din vagtplan."
        />
      </RequestCard>
    );
  }
  return (
    <RequestCard icon="assignment_ind" title="Tildelt rådighedsvagt">
      <View style={styles.infoBox}>
        <Txt font="regular" size={12} color={Colors.white} lineHeight={18}>
          Du er blevet tildelt en rådighedsvagt. Denne vagt er tildelt dig og
          skal varetages.
        </Txt>
      </View>
      <View style={styles.detailGroup}>
        <DetailRow
          icon="location_on"
          value={
            <View>
              <Txt font="semibold" size={14} color={Colors.white}>
                Rigshospitalet
              </Txt>
              <Txt font="regular" size={13} color={WHITE_80}>
                Blegdamsvej 9, KBH Ø
              </Txt>
            </View>
          }
        />
        <View style={styles.detailGrid}>
          <View style={styles.flex}>
            <DetailRow icon="calendar_today" label="Dato" value="21. december" />
          </View>
          <View style={styles.flex}>
            <DetailRow icon="schedule" label="Tid" value="10:00 – 16:00" />
          </View>
        </View>
        <DetailRow icon="coffee" label="Pause" value="12:30 – 13:00" />
      </View>
      <LightButton
        label="Forstået"
        icon="check"
        onPress={() => {
          toast.show('Rådighedsvagt bekræftet');
          setDone(true);
        }}
      />
    </RequestCard>
  );
}

function SummerPartySlide({ toast }: { toast: ToastApi }) {
  const [state, setState] = useState<'pending' | 'joined' | 'declined'>(
    'pending',
  );
  if (state !== 'pending') {
    return (
      <RequestCard icon="celebration" title="Invitation til Sommerfest!">
        <RequestDone
          icon={state === 'joined' ? 'check_circle' : 'event_busy'}
          title={state === 'joined' ? 'Du er tilmeldt!' : 'Afbud noteret'}
          body={
            state === 'joined'
              ? 'Vi glæder os til at se dig til sommerfest d. 30. august.'
              : 'Ærgerligt — vi håber at se dig næste gang.'
          }
          actionLabel="Fortryd"
          onAction={() => setState('pending')}
        />
      </RequestCard>
    );
  }
  return (
    <RequestCard icon="celebration" title="Invitation til Sommerfest!">
      <View style={styles.detailGroup}>
        <DetailRow
          icon="location_on"
          value={
            <View>
              <Txt font="semibold" size={14} color={Colors.white}>
                Strandpavillonen
              </Txt>
              <Txt font="regular" size={13} color={WHITE_80}>
                Strandvejen 102
              </Txt>
            </View>
          }
        />
        <View style={styles.detailGrid}>
          <View style={styles.flex}>
            <DetailRow icon="calendar_today" label="Dato" value="30. august" />
          </View>
          <View style={styles.flex}>
            <DetailRow icon="schedule" label="Tid" value="17:00 – 22:00" />
          </View>
        </View>
      </View>
      <LightButton
        label="Tilmeld"
        onPress={() => {
          toast.show('Tilmeldt sommerfest');
          setState('joined');
        }}
      />
      <Pressable
        onPress={() => {
          toast.show('Afbud sendt');
          setState('declined');
        }}
        style={({ pressed }) => [
          styles.ghostBtn,
          styles.declineBtn,
          styles.mt8,
          pressed && styles.dim,
        ]}>
        <Txt font="bold" size={15} color={Colors.white}>
          Afvis
        </Txt>
      </Pressable>
    </RequestCard>
  );
}

function EducationSlide({ toast }: { toast: ToastApi }) {
  const [state, setState] = useState<'pending' | 'joined' | 'declined'>(
    'pending',
  );
  if (state !== 'pending') {
    return (
      <RequestCard icon="school" title="Tilmelding til efteruddannelse">
        <RequestDone
          icon={state === 'joined' ? 'check_circle' : 'event_busy'}
          title={state === 'joined' ? 'Du er tilmeldt!' : 'Afbud noteret'}
          body={
            state === 'joined'
              ? 'Vi har reserveret din plads d. 15. september.'
              : 'Ingen tilmelding registreret.'
          }
          actionLabel="Fortryd"
          onAction={() => setState('pending')}
        />
      </RequestCard>
    );
  }
  return (
    <RequestCard icon="school" title="Tilmelding til efteruddannelse">
      <View style={styles.detailGroup}>
        <DetailRow
          icon="cast_for_education"
          value={
            <View>
              <Txt font="semibold" size={14} color={Colors.white}>
                Triggerpunktsbehandling
              </Txt>
              <Txt font="regular" size={13} color={WHITE_80}>
                Vicuras Akademi, Aarhus
              </Txt>
            </View>
          }
        />
        <View style={styles.detailGrid}>
          <View style={styles.flex}>
            <DetailRow icon="calendar_today" label="Dato" value="15. september" />
          </View>
          <View style={styles.flex}>
            <DetailRow icon="schedule" label="Tid" value="09:00 – 15:00" />
          </View>
        </View>
      </View>
      <LightButton
        label="Tilmeld"
        onPress={() => {
          toast.show('Tilmeldt efteruddannelse');
          setState('joined');
        }}
      />
      <Pressable
        onPress={() => {
          toast.show('Afbud sendt');
          setState('declined');
        }}
        style={({ pressed }) => [
          styles.ghostBtn,
          styles.declineBtn,
          styles.mt8,
          pressed && styles.dim,
        ]}>
        <Txt font="bold" size={15} color={Colors.white}>
          Afvis
        </Txt>
      </Pressable>
    </RequestCard>
  );
}

function SurveySlide({ toast }: { toast: ToastApi }) {
  const [done, setDone] = useState(false);
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);

  if (done) {
    return (
      <RequestCard icon="reviews" title="Vi vil gerne høre din mening!">
        <RequestDone
          icon="check_circle"
          title="Tak for din besvarelse!"
          body="Din feedback hjælper os med at gøre Vicuras til et bedre sted at arbejde."
          actionLabel="Svar igen"
          onAction={() => {
            setDone(false);
            setQ1(null);
            setQ2(null);
          }}
        />
      </RequestCard>
    );
  }

  return (
    <RequestCard icon="reviews" title="Vi vil gerne høre din mening!">
      <View style={styles.surveyBlock}>
        <Txt font="semibold" size={13.5} color={Colors.white} lineHeight={19}>
          Hvor tilfreds er du med at arbejde hos Vicuras?
        </Txt>
        <ScaleRow value={q1} onSelect={setQ1} />
        <View style={styles.scaleLabels}>
          <Txt font="bold" size={9} color={WHITE_60} tracking={0.4} uppercase>
            Slet ikke
          </Txt>
          <Txt font="bold" size={9} color={WHITE_60} tracking={0.4} uppercase>
            Meget tilfreds
          </Txt>
        </View>
      </View>

      <View style={[styles.surveyBlock, styles.mt16]}>
        <Txt font="semibold" size={13.5} color={Colors.white} lineHeight={19}>
          Hvor sandsynligt er det, at du ville anbefale andre at arbejde hos
          Vicuras?
        </Txt>
        <ScaleRow value={q2} onSelect={setQ2} />
        <View style={styles.scaleLabels}>
          <Txt font="bold" size={9} color={WHITE_60} tracking={0.4} uppercase>
            Slet ikke sandsynligt
          </Txt>
          <Txt font="bold" size={9} color={WHITE_60} tracking={0.4} uppercase>
            Meget sandsynligt
          </Txt>
        </View>
      </View>

      <View style={styles.mt16}>
        <LightButton
          label="Send svar"
          onPress={() => {
            toast.show('Tak for din besvarelse');
            setDone(true);
          }}
        />
      </View>
    </RequestCard>
  );
}

function ScaleRow({
  value,
  onSelect,
}: {
  value: number | null;
  onSelect: (n: number) => void;
}) {
  return (
    <View style={styles.scaleRow}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const active = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => onSelect(n)}
            style={[
              styles.scaleCell,
              {
                backgroundColor: active
                  ? Colors.white
                  : 'rgba(255,255,255,0.12)',
                borderColor: active ? Colors.white : 'rgba(255,255,255,0.25)',
              },
            ]}>
            <Txt
              font="bold"
              size={11}
              color={active ? Colors.pinkDeep : Colors.white}>
              {n}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Næste arbejdsdag                                                   */
/* ------------------------------------------------------------------ */

function NextWorkdayCard({ nav }: { nav: ReturnType<typeof useNav> }) {
  const [ratingOpen, setRatingOpen] = useState(false);

  return (
    <View>
      <SectionHeading label="Næste arbejdsdag" accentBar />
      <LinearGradient
        colors={SHIFT_GRADIENT}
        locations={[0, 0.46, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.shiftCard}>
        {/* Header */}
        <View style={styles.shiftHeader}>
          <LinearGradient
            colors={[Colors.pink, Colors.pinkDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shiftCompanyIcon}>
            <Icon name="apartment" size={26} color={Colors.white} />
          </LinearGradient>
          <View style={styles.flex}>
            <Txt font="displayBold" size={20} color={Colors.text} lineHeight={22}>
              Novo Nordisk A/S
            </Txt>
            <View style={styles.shiftLocation}>
              <Icon name="location_on" size={15} color={Colors.muted} />
              <Txt font="regular" size={12} color={Colors.muted}>
                Bagsværd 6.AK
              </Txt>
            </View>
          </View>
          <StatusPill
            label="I dag"
            color={Colors.onPink}
            background={Colors.pink}
            borderColor={Colors.pink}
          />
        </View>

        {/* Body */}
        <View style={styles.shiftBody}>
          <View style={styles.twinRow}>
            <ShiftTile icon="schedule" label="Tidspunkt" value="07:00 – 15:00" />
            <ShiftTile icon="coffee" label="Pause" value="12:00 – 12:30" />
          </View>

          {/* OBS box */}
          <View style={styles.obsBox}>
            <Icon name="info" size={20} color={Colors.pink} />
            <View style={styles.flexShrink}>
              <Txt font="bold" size={11} color={Colors.pink} tracking={0.3} uppercase>
                OBS: Aktiv tilmeldingsperiode
              </Txt>
              <Txt
                font="regular"
                size={12}
                color={WHITE_90}
                lineHeight={18}
                style={styles.mt4}>
                Husk at informere dine klienter om, at der er åbent for
                tilmelding med opstart fra d. 1. november.
              </Txt>
            </View>
          </View>

          {/* CTA */}
          <PinkButton
            label="Se dagens aftaler"
            icon="arrow_forward"
            expand
            onPress={nav.openTodaysProgram}
          />

          {/* Two tiles */}
          <View style={styles.twinRow}>
            <ActionTile
              icon="inventory_2"
              label="Materialer og linned"
              onPress={nav.openOrderMaterials}
            />
            <ActionTile
              icon="menu_book"
              label="Behandlervejledning"
              onPress={() => nav.openTreatmentGuide()}
            />
          </View>

          {/* Rating section */}
          <View style={styles.ratingSection}>
            <Pressable
              onPress={() => setRatingOpen((o) => !o)}
              style={({ pressed }) => [styles.ratingToggle, pressed && styles.dim]}>
              <Icon name="star" size={18} color={Colors.pink} />
              <Txt font="bold" size={12.5} color={Colors.pink} style={styles.flex}>
                Dagens rating: 9/10
              </Txt>
              <Icon
                name={ratingOpen ? 'expand_less' : 'expand_more'}
                size={20}
                color={Colors.pink}
              />
            </Pressable>

            {ratingOpen ? (
              <View style={styles.mt8}>
                <View style={styles.ratingScoreBox}>
                  <Txt font="displayExtrabold" size={28} color={Colors.pink} lineHeight={28}>
                    9
                    <Txt font="semibold" size={14} color={Colors.muted}>
                      /10
                    </Txt>
                  </Txt>
                  <View style={styles.flex}>
                    <View style={styles.ratingTrack}>
                      <LinearGradient
                        colors={['#C81FD4', '#D633E0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ratingFill}
                      />
                    </View>
                    <Txt font="regular" size={11} color={Colors.muted} style={styles.mt6}>
                      Gennemsnit for dagens behandlinger
                    </Txt>
                  </View>
                </View>
                <Txt
                  font="bold"
                  size={10}
                  color={Colors.muted}
                  tracking={0.5}
                  uppercase
                  style={styles.mt8}>
                  Positive kommentarer fra dagen
                </Txt>
                <View style={styles.commentList}>
                  {[
                    'Super behandling, jeg følte mig virkelig godt tilpas.',
                    'Meget professionel og imødekommende behandler.',
                  ].map((c) => (
                    <View key={c} style={styles.commentRow}>
                      <Icon name="thumb_up" size={16} color={Colors.success} />
                      <Txt
                        font="regular"
                        size={12.5}
                        color={WHITE_90}
                        lineHeight={18}
                        style={[styles.flexShrink, styles.italic]}>
                        &quot;{c}&quot;
                      </Txt>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function ShiftTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.shiftTile}>
      <View style={styles.shiftTileHeader}>
        <Icon name={icon} size={16} color={Colors.pink} />
        <Txt font="bold" size={9} color={Colors.faint} tracking={0.5} uppercase>
          {label}
        </Txt>
      </View>
      <Txt font="bold" size={14} color={Colors.text}>
        {value}
      </Txt>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionTile, pressed && styles.dim]}>
      <View style={styles.actionTileIcon}>
        <Icon name={icon} size={19} color={Colors.pink} />
      </View>
      <Txt
        font="bold"
        size={12}
        color={Colors.text}
        align="center"
        lineHeight={16}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Dagens program                                                     */
/* ------------------------------------------------------------------ */

interface Appt {
  time: string;
  name: string;
  service: string;
  active?: boolean;
  done?: boolean;
}

const APPTS: Appt[] = [
  { time: '07:30', name: 'Mette Frandsen', service: 'Fysiurgisk massage · 30 min', done: true },
  { time: '08:15', name: 'Jonas Berg', service: 'Sportsmassage · 45 min', active: true },
  { time: '09:15', name: 'Anne Mortensen', service: 'Klassisk massage · 30 min' },
];

function TodaysProgram({
  onOpen,
  toast,
}: {
  onOpen: () => void;
  toast: ToastApi;
}) {
  return (
    <View>
      <View style={styles.programHeader}>
        <View style={styles.flexShrink}>
          <View style={styles.programTitleRow}>
            <Txt font="bold" size={12} color={Colors.muted} tracking={2.2} uppercase>
              Dagens program
            </Txt>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Txt font="extrabold" size={9} color={Colors.success} tracking={1.4}>
                LIVE
              </Txt>
            </View>
          </View>
          <View style={styles.programSubRow}>
            <Icon name="sync" size={14} color={Colors.success} />
            <Txt font="regular" size={12} color={Colors.muted}>
              Opdateres løbende · 10 behandlinger i dag
            </Txt>
          </View>
        </View>
        <ArrowLink label="Se dagens aftaler" onPress={onOpen} />
      </View>

      <View style={styles.timeline}>
        {APPTS.map((a, i) => (
          <ApptRow
            key={a.time}
            appt={a}
            last={i === APPTS.length - 1}
            toast={toast}
          />
        ))}
      </View>
    </View>
  );
}

function ApptRow({
  appt,
  last,
  toast,
}: {
  appt: Appt;
  last: boolean;
  toast: ToastApi;
}) {
  const timeColor = appt.done
    ? Colors.faint
    : appt.active
      ? Colors.pink
      : Colors.muted;
  return (
    <View style={[styles.apptRow, appt.done && styles.apptDone]}>
      <View style={styles.apptTimeCol}>
        <Txt font="bold" size={12} color={timeColor}>
          {appt.time}
        </Txt>
        {!last ? <View style={styles.apptLine} /> : null}
      </View>
      <View
        style={[
          styles.apptCard,
          appt.active && styles.apptCardActive,
        ]}>
        <View style={styles.apptCardTop}>
          <View style={styles.apptNameRow}>
            {appt.active ? (
              <StatusPill label="Nu" />
            ) : null}
            <Txt font="bold" size={15} color={Colors.text}>
              {appt.name}
            </Txt>
          </View>
          {appt.active ? (
            <Pressable
              onPress={() => toast.show('Tilmeld nyt udbud')}
              style={({ pressed }) => [styles.qrBtn, pressed && styles.dim]}>
              <Icon name="qr_code_2" size={20} color={Colors.white} />
            </Pressable>
          ) : null}
        </View>
        <Txt font="regular" size={13} color={Colors.muted} style={styles.mt2}>
          {appt.service}
        </Txt>

        {appt.active ? (
          <View>
            <Pressable
              onPress={() => toast.show('Åbner journal')}
              style={({ pressed }) => [styles.journalBtn, pressed && styles.dim]}>
              <Icon name="edit_note" size={16} color={Colors.pink} />
              <Txt font="bold" size={12} color={Colors.pink}>
                Åbn journal
              </Txt>
            </Pressable>
            <View style={[styles.twinRow, styles.mt8]}>
              <Pressable
                onPress={() => toast.show('Behandling gennemført')}
                style={({ pressed }) => [styles.statusBtnDone, pressed && styles.dim]}>
                <Icon name="check" size={18} color={Colors.success} />
                <Txt font="bold" size={10} color={Colors.success} uppercase>
                  Gennemført
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => toast.show('Markeret som udeblevet')}
                style={({ pressed }) => [styles.statusBtnAbsent, pressed && styles.dim]}>
                <Icon name="person_off" size={18} color={Colors.warning} />
                <Txt font="bold" size={10} color={Colors.warning} uppercase>
                  Udeblevet
                </Txt>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Mit overblik                                                       */
/* ------------------------------------------------------------------ */

function MyOverview({
  onProfile,
  toast,
}: {
  onProfile: () => void;
  toast: ToastApi;
}) {
  return (
    <View>
      <SectionHeading label="Mit overblik" />
      <GlassCard
        gradient={PANEL_GRADIENT}
        radius={28}
        borderColor={Alpha.hairlineSoft}
        style={styles.overviewPanel}>
        {/* Rating stat */}
        <View style={styles.statCard}>
          <Txt font="regular" size={14} color={Colors.text} style={styles.mb12}>
            Din gennemsnitlige <Txt font="bold" size={14}>rating</Txt>
          </Txt>
          <View style={styles.statTwin}>
            <View style={styles.statPink}>
              <Txt font="bold" size={9} color={Colors.muted} tracking={0.7} uppercase>
                Seneste 120 dage
              </Txt>
              <Txt font="displayExtrabold" size={20} color={Colors.pink} lineHeight={22} style={styles.mt4}>
                9,2
                <Txt font="semibold" size={12} color="rgba(243,244,255,0.7)">
                  /10
                </Txt>
              </Txt>
            </View>
            <View style={styles.statNeutral}>
              <Txt font="bold" size={9} color={Colors.muted} tracking={0.7} uppercase>
                Siden start
              </Txt>
              <Txt font="displayExtrabold" size={20} color={Colors.text} lineHeight={22} style={styles.mt4}>
                8,9
                <Txt font="semibold" size={12} color="rgba(243,244,255,0.5)">
                  /10
                </Txt>
              </Txt>
            </View>
          </View>
        </View>

        {/* Behandlinger stat */}
        <View style={styles.statCard}>
          <Txt font="regular" size={14} color={Colors.text}>
            Behandlinger <Txt font="bold" size={14}>denne måned</Txt>
          </Txt>
          <Txt font="displayExtrabold" size={20} color={Colors.pink} style={styles.mt2}>
            128
            <Txt font="semibold" size={14} color="rgba(243,244,255,0.85)">
              {'   '}behandlinger
            </Txt>
          </Txt>
          <Txt font="regular" size={12} color={Colors.muted} style={styles.mt2}>
            +12 % i forhold til sidste måned
          </Txt>
        </View>

        {/* Seneste anmeldelser */}
        <View style={styles.statCard}>
          <View style={styles.reviewHeader}>
            <Txt font="bold" size={10} color={Colors.muted} tracking={1.4} uppercase>
              Seneste anmeldelser
            </Txt>
            <View style={styles.reviewScore}>
              <Icon name="star" size={15} color={Colors.pink} />
              <Txt font="bold" size={12} color={Colors.pink}>
                5,0
              </Txt>
            </View>
          </View>
          <View style={styles.reviewCard}>
            <Icon name="format_quote" size={26} color="rgba(217,74,230,0.25)" style={styles.quoteIcon} />
            <View style={styles.starRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={14} color={Colors.pink} />
              ))}
            </View>
            <Txt
              font="regular"
              size={13}
              color={Colors.text}
              lineHeight={20}
              style={[styles.italic, styles.mb12]}>
              &quot;Fantastisk behandling! Lars er utrolig dygtig og lyttende. Jeg
              følte mig i trygge hænder hele vejen igennem.&quot;
            </Txt>
            <View style={styles.reviewFooter}>
              <View style={styles.reviewAuthor}>
                <Avatar initials="MF" size={30} fontSize={10} />
                <View>
                  <Txt font="bold" size={12} color={Colors.text}>
                    Mette F.
                  </Txt>
                  <Txt font="regular" size={10} color={Colors.muted}>
                    Patient v. Novo Nordisk
                  </Txt>
                </View>
              </View>
              <Txt font="regular" size={10} color={Colors.faint}>
                21. okt. 2023
              </Txt>
            </View>
          </View>
          <Pressable
            onPress={() => toast.show('Åbner alle anmeldelser')}
            style={({ pressed }) => [styles.allReviews, pressed && styles.dim]}>
            <Txt font="bold" size={11} color={Colors.pink} tracking={1} uppercase>
              Se alle 142 anmeldelser
            </Txt>
            <Icon name="arrow_forward" size={16} color={Colors.pink} />
          </Pressable>
        </View>

        <Pressable
          onPress={onProfile}
          style={({ pressed }) => [styles.fullOverview, pressed && styles.dim]}>
          <Txt font="bold" size={14} color={Colors.text}>
            Få det fulde overblik
          </Txt>
          <Icon name="arrow_forward" size={18} color={Colors.pink} />
        </Pressable>
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Hurtig adgang                                                      */
/* ------------------------------------------------------------------ */

function QuickAccess({ nav }: { nav: ReturnType<typeof useNav> }) {
  const items: { icon: string; label: string; onPress: () => void }[] = [
    { icon: 'calendar_month', label: 'Vagtplan', onPress: () => nav.setTab('calendar') },
    { icon: 'task_alt', label: 'Mine opgaver', onPress: () => nav.setTab('tasks') },
    { icon: 'forum', label: 'Forum', onPress: () => nav.setTab('forum') },
    { icon: 'inventory_2', label: 'Bestil', onPress: nav.openOrderMaterials },
  ];
  return (
    <View>
      <SectionHeading label="Hurtig adgang" />
      <GlassCard
        gradient={PANEL_GRADIENT}
        radius={28}
        borderColor={Alpha.hairlineSoft}>
        <View style={styles.quickGrid}>
          {items.map((q) => (
            <Pressable
              key={q.label}
              onPress={q.onPress}
              style={({ pressed }) => [styles.quickBtn, pressed && styles.dim]}>
              <Icon name={q.icon} size={22} color={Colors.white} />
              <Txt font="bold" size={14} color={Colors.white}>
                {q.label}
              </Txt>
            </Pressable>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Seneste nyt                                                        */
/* ------------------------------------------------------------------ */

function LatestNews({ toast }: { toast: ToastApi }) {
  const news = [
    'Nye retningslinjer for hygiejne træder i kraft 1. juli',
    'Vicuras åbner ny klinik i Odense til efteråret',
    'Webinar om ergonomi for behandlere — tilmeld dig nu',
    'Opdateret behandlervejledning er nu tilgængelig',
  ];
  return (
    <View>
      <View style={styles.newsHeading}>
        <Txt font="displayBold" size={15} color={Colors.pink}>
          Seneste nyt{' '}
          <Txt font="displayBold" size={15} color={Colors.text}>
            fra Vicuras
          </Txt>
        </Txt>
      </View>
      <GlassCard radius={24}>
        {news.map((text, i) => (
          <View key={text}>
            {i > 0 ? <Divider /> : null}
            <Pressable
              onPress={() => toast.show('Åbner nyhed')}
              style={({ pressed }) => [styles.newsRow, pressed && styles.dim]}>
              <Txt font="regular" size={14} color={WHITE_90} style={styles.flexShrink}>
                {text}
              </Txt>
              <Icon name="arrow_forward" size={18} color={Colors.pink} />
            </Pressable>
          </View>
        ))}
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  dim: { opacity: 0.7 },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mb12: { marginBottom: 12 },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: CARD_GAP,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -CARD_GAP + 4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  /* Greeting */
  greetingName: { marginTop: 4 },
  greetingUnderline: {
    height: 4,
    width: 64,
    borderRadius: 999,
    marginTop: 12,
  },

  /* Section heading */
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headingBar: { height: 4, width: 40, borderRadius: 999 },

  /* Birthday */
  birthdayCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  birthdayIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Carousel */
  swipeHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  carouselContent: { marginHorizontal: -2 },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  dot: { height: 8, borderRadius: 999 },

  /* Request card */
  requestCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  requestIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailGroup: { gap: 12, marginBottom: 20 },
  detailGrid: { flexDirection: 'row', gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailIcon: { marginTop: 2 },
  infoBox: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  lightBtn: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostBtn: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    paddingVertical: 12,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  twinRow: { flexDirection: 'row', gap: 8 },
  requestDone: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  /* Survey */
  surveyBlock: { gap: 12 },
  scaleRow: { flexDirection: 'row', gap: 4 },
  scaleCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  /* Shift card */
  shiftCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  shiftHeader: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  shiftCompanyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftLocation: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  shiftBody: { padding: 16, gap: 12 },
  shiftTile: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shiftTileHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  obsBox: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(217,74,230,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.25)',
  },
  actionTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  actionTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(217,74,230,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    paddingTop: 14,
  },
  ratingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.25)',
  },
  ratingScoreBox: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.2)',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  ratingFill: { width: '90%', height: '100%' },
  commentList: { gap: 6, marginTop: 6 },
  commentRow: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    gap: 8,
  },

  /* Dagens program */
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  programTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(98,226,166,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(98,226,166,0.4)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: Colors.success },
  programSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  timeline: { gap: 12 },
  apptRow: { flexDirection: 'row', gap: 12 },
  apptDone: { opacity: 0.55 },
  apptTimeCol: { width: 48, alignItems: 'center', paddingTop: 4 },
  apptLine: {
    width: 1,
    flex: 1,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  apptCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  apptCardActive: {
    backgroundColor: 'rgba(217,74,230,0.07)',
    borderColor: Alpha.pinkBorder,
  },
  apptCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apptNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  qrBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalBtn: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Alpha.pinkBorder,
    backgroundColor: 'rgba(217,74,230,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statusBtnDone: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Alpha.successBorder,
    backgroundColor: Alpha.successTint,
  },
  statusBtnAbsent: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Alpha.warningBorder,
    backgroundColor: Alpha.warningTint,
  },

  /* Mit overblik */
  overviewPanel: { gap: 12 },
  statCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  statTwin: { flexDirection: 'row', gap: 10 },
  statPink: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.18)',
  },
  statNeutral: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewScore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.2)',
  },
  quoteIcon: { position: 'absolute', top: 10, right: 12 },
  starRow: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  allReviews: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fullOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },

  /* Hurtig adgang */
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  quickBtn: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  /* Seneste nyt */
  newsHeading: { marginBottom: 12 },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
});
