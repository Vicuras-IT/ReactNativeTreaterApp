import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchRoomDetails, type RoomDetailsData } from '@/api';
import {
  Avatar,
  DesignBackground,
  Icon,
  PillTabs,
  Txt,
} from '@/components/ui';
import { useAuth } from '@/state/auth-context';
import { Alpha, Colors, Radius, Spacing } from '@/theme';

type GuideTab = 'arrival' | 'contact' | 'linen' | 'colleagues';

const TABS: { key: GuideTab; label: string }[] = [
  { key: 'arrival', label: 'Ankomst' },
  { key: 'contact', label: 'Kontakt' },
  { key: 'linen', label: 'Linned' },
  { key: 'colleagues', label: 'Kolleger' },
];

interface Colleague {
  name: string;
  initials: string;
  role: string;
  weekday: string;
  weeks: 'Lige uger' | 'Ulige uger' | 'Alle uger';
}

const DEMO_COLLEAGUES: Colleague[] = [
  {
    name: 'Mette Sørensen',
    initials: 'MS',
    role: 'Massør',
    weekday: 'Mandag & onsdag',
    weeks: 'Lige uger',
  },
  {
    name: 'Anders Holm',
    initials: 'AH',
    role: 'Fysioterapeut',
    weekday: 'Tirsdag & torsdag',
    weeks: 'Ulige uger',
  },
  {
    name: 'Camilla Berg',
    initials: 'CB',
    role: 'Akupunktør',
    weekday: 'Fredag',
    weeks: 'Alle uger',
  },
];

export function TreatmentGuideScreen({
  onBack,
  params,
}: {
  onBack: () => void;
  params?: Record<string, unknown>;
}) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [tab, setTab] = useState<GuideTab>('arrival');
  const [room, setRoom] = useState<RoomDetailsData | null>(null);

  const roomId =
    typeof params?.roomId === 'string' && params.roomId.trim().length > 0
      ? params.roomId
      : null;

  useEffect(() => {
    if (!roomId || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRoomDetails(token, String(roomId), 'da');
        if (!cancelled) setRoom(data);
      } catch {
        // Optional enrichment — fall back to demo content on any error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, token]);

  const subtitle = room?.address?.trim()
    ? room.address
    : 'Novo Nordisk A/S · Bagsværd (6.AK)';

  return (
    <DesignBackground>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <Icon name="arrow_back" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.flex}>
            <Txt font="displayBold" size={19} color={Colors.text}>
              Behandlervejledning
            </Txt>
            <View style={styles.subtitleRow}>
              <Icon name="location_on" size={14} color={Colors.pink} />
              <Txt font="medium" size={12} color={Colors.pink} style={styles.flex}>
                {subtitle}
              </Txt>
            </View>
          </View>
        </View>
        <PillTabs<GuideTab>
          tabs={TABS}
          selected={tab}
          onSelect={setTab}
          scroll
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {tab === 'arrival' ? <ArrivalTab room={room} /> : null}
        {tab === 'contact' ? <ContactTab /> : null}
        {tab === 'linen' ? <LinenTab room={room} /> : null}
        {tab === 'colleagues' ? <ColleaguesTab room={room} /> : null}
      </ScrollView>
    </DesignBackground>
  );
}

/* ------------------------------- Ankomst ------------------------------ */

function ArrivalTab({ room }: { room: RoomDetailsData | null }) {
  // Prefer live "Adgang" tab sections when available; else use demo copy.
  const accessTab = room?.tabs.find((t) => t.title === 'Adgang');

  return (
    <View style={styles.stack}>
      <View style={styles.tileRow}>
        <ImageTile label="Novo Nordisk Campus" badge="HOVEDINDGANG" />
        <ImageTile label="Behandlerrum 6.AK" />
      </View>

      <View style={styles.card}>
        <CardHeader icon="directions_walk" title="Ankomst & Lokale" />

        <View style={styles.parkingBox}>
          <View style={styles.parkingTitleRow}>
            <Icon name="local_parking" size={16} color={Colors.lilac} />
            <Txt font="bold" size={12} color={Colors.text}>
              Parkering
            </Txt>
          </View>
          <Txt font="regular" size={12.5} color={Colors.muted} lineHeight={19}>
            {accessTab?.sections.find((s) => s.title === 'Parkering')?.content ??
              'Benyt P4. Registrér din nummerplade i receptionen for gratis parkering.'}
          </Txt>
        </View>

        <SubSection
          label="Find vej"
          text={
            accessTab?.sections.find((s) => s.title === 'Ankomstinformation')
              ?.content ??
            'Gå gennem kantinen, tag elevatoren til 2. sal. Lokale 6.AK ligger til venstre for kaffestationen.'
          }
        />
        <SubSection
          label="Behandlerlokalet"
          text={
            accessTab?.sections.find(
              (s) => s.title === 'Adgang til behandlingsrum',
            )?.content ??
            'Lokale 6.AK. Briks, olie og linned står klar ved ankomst. Husk at lufte ud mellem behandlinger og bær altid synligt gæstekort, mens du opholder dig på sitet.'
          }
        />
        <SubSection
          label="Ved dagens afslutning"
          text={
            accessTab?.sections.find(
              (s) => s.title === 'Afslutning af arbejdsdag',
            )?.content ??
            'Rengør briks, sluk lyset og lås døren. Aflevér gæstekort i receptionen.'
          }
        />

        <View style={styles.cardDivider} />

        <CardHeader icon="contact_phone" title="Kontakt & Reception" />
        <View style={styles.contactRow}>
          <InfoBlock label="Kontaktperson" value="Henrik Lund" />
          <InfoBlock label="Reception" value="44 44 88 88" align="right" />
        </View>
      </View>
    </View>
  );
}

/* ------------------------------- Kontakt ------------------------------ */

function ContactTab() {
  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <CardHeader icon="contact_phone" title="Kontakt & Reception" />
        <ContactLine
          icon="apartment"
          label="Reception"
          value="44 44 88 88"
          note="Åben man–fre 07:00–17:00"
        />
        <ContactLine
          icon="person"
          label="Kontaktperson"
          value="Henrik Lund"
          note="Facility Manager"
        />
        <ContactLine
          icon="phone"
          label="Vagttelefon"
          value="+45 22 33 44 55"
          note="Uden for åbningstid"
        />
        <ContactLine
          icon="key"
          label="Adgang"
          value="Gæstekort i receptionen"
          note="Husk billed-ID"
        />
      </View>
    </View>
  );
}

/* ------------------------------- Linned ------------------------------- */

function LinenTab({ room }: { room: RoomDetailsData | null }) {
  const linenTab = room?.tabs.find(
    (t) => t.title === 'Lagener / Linned' || t.title === 'Linen',
  );

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <CardHeader icon="local_laundry_service" title="Lagener & Linned" />
        {linenTab ? (
          linenTab.sections.map((s) => (
            <SubSection key={s.title} label={s.title} text={s.content} />
          ))
        ) : (
          <>
            <SubSection
              label="Antal lagener"
              text="Der leveres 20 sæt rent linned pr. uge. Brugt linned lægges i den blå vasketøjssæk."
            />
            <SubSection
              label="Leveringsdag"
              text="Hver mandag morgen inden kl. 08:00."
            />
            <SubSection
              label="Leveringssted"
              text="Linnedskabet ved siden af lokale 6.AK. Nøgle hænger i receptionen."
            />
            <SubSection
              label="Afhentningssted"
              text="Brugt linned afhentes samme sted hver fredag eftermiddag."
            />
          </>
        )}
      </View>
    </View>
  );
}

/* ------------------------------- Kolleger ----------------------------- */

function ColleaguesTab({ room }: { room: RoomDetailsData | null }) {
  const treaters = room?.associatedTreaters ?? [];

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <CardHeader icon="people" title="Kolleger på sitet" />
        {treaters.length > 0
          ? treaters.map((t) => (
              <ColleagueRow
                key={t.name}
                name={t.name}
                initials={deriveInitials(t.name)}
                pictureBase64={t.pictureOfTreater || null}
                role="Behandler"
                weekday={[t.daysEven && `Lige: ${t.daysEven}`, t.daysOdd && `Ulige: ${t.daysOdd}`]
                  .filter(Boolean)
                  .join(' · ')}
              />
            ))
          : DEMO_COLLEAGUES.map((c) => (
              <ColleagueRow
                key={c.name}
                name={c.name}
                initials={c.initials}
                role={c.role}
                weekday={c.weekday}
                weeks={c.weeks}
              />
            ))}
      </View>
    </View>
  );
}

/* --------------------------- Sub-components --------------------------- */

function ImageTile({ label, badge }: { label: string; badge?: string }) {
  return (
    <View style={styles.tile}>
      <View style={styles.stripes} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={i} style={styles.stripe} />
        ))}
      </View>
      {badge ? (
        <View style={styles.tileBadge}>
          <Txt font="bold" size={8} color={Colors.onPink} tracking={0.4}>
            {badge}
          </Txt>
        </View>
      ) : null}
      <Txt font="bold" size={11} color={Colors.text} style={styles.tileLabel}>
        {label}
      </Txt>
    </View>
  );
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.cardHeader}>
      <Icon name={icon} size={20} color={Colors.pink} />
      <Txt font="display" size={16} color={Colors.text}>
        {title}
      </Txt>
    </View>
  );
}

function SubSection({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.subSection}>
      <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase>
        {label}
      </Txt>
      <Txt font="regular" size={13.5} color={Colors.text} lineHeight={21}>
        {text}
      </Txt>
    </View>
  );
}

function InfoBlock({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <View style={align === 'right' ? styles.alignRight : undefined}>
      <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase>
        {label}
      </Txt>
      <Txt font="semibold" size={15} color={Colors.text}>
        {value}
      </Txt>
    </View>
  );
}

function ContactLine({
  icon,
  label,
  value,
  note,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View style={styles.contactLine}>
      <View style={styles.contactIcon}>
        <Icon name={icon} size={18} color={Colors.lilac} />
      </View>
      <View style={styles.flex}>
        <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase>
          {label}
        </Txt>
        <Txt font="semibold" size={14.5} color={Colors.text}>
          {value}
        </Txt>
        <Txt font="regular" size={12} color={Colors.muted}>
          {note}
        </Txt>
      </View>
    </View>
  );
}

function ColleagueRow({
  name,
  initials,
  role,
  weekday,
  weeks,
  pictureBase64,
}: {
  name: string;
  initials: string;
  role: string;
  weekday: string;
  weeks?: string;
  pictureBase64?: string | null;
}) {
  return (
    <View style={styles.colleagueRow}>
      <Avatar initials={initials} pictureBase64={pictureBase64} size={44} />
      <View style={styles.flex}>
        <Txt font="semibold" size={14.5} color={Colors.text}>
          {name}
        </Txt>
        <Txt font="medium" size={12} color={Colors.lilac}>
          {role}
        </Txt>
        <Txt font="regular" size={12} color={Colors.muted}>
          {weekday}
          {weeks ? ` · ${weeks}` : ''}
        </Txt>
      </View>
    </View>
  );
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* -------------------------------- Styles ------------------------------ */

const styles = StyleSheet.create({
  flex: { flexShrink: 1, flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 12,
    gap: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 4,
    paddingBottom: 40,
  },
  stack: { gap: 16 },

  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#10153f',
    justifyContent: 'flex-end',
    padding: 10,
  },
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    transform: [{ rotate: '20deg' }, { scale: 1.6 }],
  },
  stripe: {
    width: 10,
    height: '100%',
    backgroundColor: 'rgba(120,132,255,0.10)',
    marginRight: 10,
  },
  tileBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.pink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tileLabel: { zIndex: 2 },

  card: {
    borderRadius: Radius.xl,
    padding: 18,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    gap: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 0,
  },

  parkingBox: {
    borderRadius: Radius.md,
    padding: 14,
    backgroundColor: 'rgba(122,132,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(122,132,255,0.2)',
    gap: 4,
  },
  parkingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  subSection: { gap: 6 },

  contactRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  alignRight: { alignItems: 'flex-end' },

  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(122,132,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(122,132,255,0.2)',
  },

  colleagueRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
