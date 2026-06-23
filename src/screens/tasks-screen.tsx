import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HeaderIconButton,
  Icon,
  SectionLabel,
  StatusPill,
  Txt,
  useToast,
} from '@/components/ui';
import { useNav } from '@/state/navigation-context';
import { Alpha, Colors, Radius, RequestGradient } from '@/theme';

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

type TaskClient =
  | {
      id: string;
      kind: 'journal';
      name: string;
      svc: string;
      last: string;
    }
  | {
      id: string;
      kind: 'status';
      name: string;
      svc: string;
      last: string;
    };

const TASK_CLIENTS: TaskClient[] = [
  {
    id: 'c1',
    kind: 'journal',
    name: 'Mette Sørensen',
    svc: 'Fysioterapi',
    last: 'I går 14:30',
  },
  {
    id: 'c2',
    kind: 'journal',
    name: 'Anders Holm',
    svc: 'Massage',
    last: 'I går 11:00',
  },
  {
    id: 'c3',
    kind: 'status',
    name: 'Camilla Berg',
    svc: 'Akupunktur',
    last: 'I dag 09:15',
  },
  {
    id: 'c4',
    kind: 'status',
    name: 'Jonas Lind',
    svc: 'Fysioterapi',
    last: 'I dag 10:45',
  },
];

interface ShiftRequest {
  id: string;
  place: string;
  date: string;
  time: string;
  loc: string;
  pause: string;
}

const SHIFT_REQUESTS: ShiftRequest[] = [
  {
    id: 'r1',
    place: 'Vicuras Klinik Østerbro',
    date: '28. maj',
    time: '08:00 – 16:00',
    loc: 'Rum 3, 2. sal',
    pause: '12:00 – 12:30',
  },
  {
    id: 'r2',
    place: 'Vicuras Klinik Valby',
    date: '30. maj',
    time: '09:00 – 15:00',
    loc: 'Rum 1, stuen',
    pause: '12:30 – 13:00',
  },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type StatusResolution = 'done' | 'absent';
type RequestState = 'pending' | 'accepted' | 'rejected';

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const nav = useNav();

  const [resolutions, setResolutions] = useState<
    Record<string, StatusResolution>
  >({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requestStates, setRequestStates] = useState<
    Record<string, RequestState>
  >({});

  const journalCount = TASK_CLIENTS.filter((c) => c.kind === 'journal').length;
  const statusUnresolved = TASK_CLIENTS.filter(
    (c) => c.kind === 'status' && !resolutions[c.id],
  ).length;
  const missingCount = journalCount + statusUnresolved;

  const pendingRequests = SHIFT_REQUESTS.filter(
    (r) => (requestStates[r.id] ?? 'pending') === 'pending',
  ).length;

  const resolveStatus = (client: TaskClient, resolution: StatusResolution) => {
    setResolutions((prev) => ({ ...prev, [client.id]: resolution }));
    toast.show(
      resolution === 'done'
        ? `${client.name} markeret som gennemført`
        : `${client.name} markeret som udeblevet`,
    );
  };

  const onAccept = (request: ShiftRequest) => {
    setRequestStates((prev) => ({ ...prev, [request.id]: 'accepted' }));
    setExpanded(null);
    toast.show('Vagt accepteret');
  };

  const onReject = (request: ShiftRequest) => {
    setRequestStates((prev) => ({ ...prev, [request.id]: 'rejected' }));
    setExpanded(null);
    toast.show('Vagt afvist');
  };

  const onApproveInvoice = () => toast.show('Faktura godkendt');

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8 },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="clinical_notes" size={24} color={Colors.pink} />
          <Txt font="displayBold" size={19} color={Colors.text}>
            Mine opgaver
          </Txt>
        </View>
        <View style={styles.headerRight}>
          <HeaderIconButton
            icon="notifications"
            onPress={nav.openNotifications}
          />
          <HeaderIconButton
            icon="settings"
            onPress={() => nav.setTab('profile')}
          />
        </View>
      </View>

      {/* Udestående behandlinger */}
      <View style={styles.section}>
        <SectionLabel
          trailing={
            <StatusPill
              label={`${missingCount} mangler`}
              color={Colors.danger}
              background={Alpha.dangerTint}
              borderColor={Alpha.dangerBorder}
            />
          }>
          Udestående behandlinger
        </SectionLabel>
        <View style={styles.list}>
          {TASK_CLIENTS.map((client) =>
            client.kind === 'journal' ? (
              <JournalItem
                key={client.id}
                client={client}
                onPress={() =>
                  toast.show(`Åbner journalføring for ${client.name}`)
                }
              />
            ) : (
              <StatusItem
                key={client.id}
                client={client}
                resolution={resolutions[client.id]}
                onResolve={(r) => resolveStatus(client, r)}
              />
            ),
          )}
        </View>
      </View>

      {/* Vagtanmodninger */}
      <View style={styles.section}>
        <SectionLabel
          trailing={<StatusPill label={`${pendingRequests} afventer`} />}>
          Vagtanmodninger
        </SectionLabel>
        <View style={styles.list}>
          {SHIFT_REQUESTS.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              state={requestStates[request.id] ?? 'pending'}
              expanded={expanded === request.id}
              onToggle={() =>
                setExpanded((prev) =>
                  prev === request.id ? null : request.id,
                )
              }
              onAccept={() => onAccept(request)}
              onAdjust={() =>
                toast.show(`Justering sendt for ${request.place}`)
              }
              onReject={() => onReject(request)}
            />
          ))}
        </View>
      </View>

      {/* Økonomi & Fakturering */}
      <View style={styles.section}>
        <SectionLabel>Økonomi &amp; Fakturering</SectionLabel>
        <LinearGradient
          colors={['#1C1E80', '#14155F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.invoiceCard}>
          <View style={styles.invoiceLeft}>
            <View style={styles.invoiceIcon}>
              <Icon name="receipt_long" size={24} color={Colors.pink} />
            </View>
            <View style={styles.flexShrink}>
              <Txt font="semibold" size={15} color={Colors.text}>
                Faktura 24. maj
              </Txt>
              <Txt
                font="regular"
                size={13}
                color={Colors.muted}
                style={styles.invoiceSub}>
                Venter på din godkendelse
              </Txt>
            </View>
          </View>
          <Pressable
            onPress={onApproveInvoice}
            style={({ pressed }) => [
              styles.approveBtn,
              pressed && { opacity: 0.85 },
            ]}>
            <Txt
              font="bold"
              size={12}
              color={Colors.onPink}
              tracking={0.6}
              uppercase>
              Godkend
            </Txt>
          </Pressable>
        </LinearGradient>
      </View>

      {/* Statusrapportering */}
      <View style={styles.section}>
        <SectionLabel>Statusrapportering</SectionLabel>
        <View style={styles.list}>
          <ReportButton
            icon="fact_check"
            title="Lokalestatus"
            subtitle="Dokumentér lokalets tilstand"
            onPress={nav.openOrderMaterials}
          />
          <ReportButton
            icon="photo_camera"
            title="Linnedbeholdning"
            subtitle="Indmeld status på beholdning"
            onPress={nav.openOrderMaterials}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function JournalItem({
  client,
  onPress,
}: {
  client: Extract<TaskClient, { kind: 'journal' }>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.clientRow, pressed && { opacity: 0.8 }]}>
      <View style={[styles.iconBox, styles.dangerBox]}>
        <Icon name="edit_note" size={20} color={Colors.danger} />
      </View>
      <View style={styles.flexShrink}>
        <Txt font="bold" size={14} color={Colors.text}>
          {client.name}
        </Txt>
        <Txt
          font="regular"
          size={11.5}
          color={Colors.muted}
          style={styles.clientMeta}>
          {client.svc} · {client.last}
        </Txt>
      </View>
      <Txt
        font="bold"
        size={9}
        color={Colors.danger}
        tracking={0.4}
        uppercase
        style={styles.flexShrink}>
        Mangler journal
      </Txt>
      <Icon name="chevron_right" size={20} color={Colors.faint} />
    </Pressable>
  );
}

function StatusItem({
  client,
  resolution,
  onResolve,
}: {
  client: Extract<TaskClient, { kind: 'status' }>;
  resolution: StatusResolution | undefined;
  onResolve: (resolution: StatusResolution) => void;
}) {
  const resolved = resolution != null;
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.iconBox, styles.warningBox]}>
          <Icon name="fact_check" size={20} color={Colors.warning} />
        </View>
        <View style={styles.flexShrink}>
          <Txt font="bold" size={14} color={Colors.text}>
            {client.name}
          </Txt>
          <Txt
            font="regular"
            size={11.5}
            color={Colors.muted}
            style={styles.clientMeta}>
            {client.svc} · {client.last}
          </Txt>
        </View>
        {resolved ? (
          <View style={styles.resolvedBadge}>
            <Icon name="task_alt" size={16} color={Colors.success} />
            <Txt font="bold" size={10} color={Colors.success} uppercase>
              {resolution === 'done' ? 'Gennemført' : 'Udeblevet'}
            </Txt>
          </View>
        ) : null}
      </View>
      {!resolved ? (
        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => onResolve('done')}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.doneBtn,
              pressed && { opacity: 0.8 },
            ]}>
            <Icon name="check" size={16} color={Colors.success} />
            <Txt font="bold" size={10} color={Colors.success} uppercase>
              Gennemført
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => onResolve('absent')}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.absentBtn,
              pressed && { opacity: 0.8 },
            ]}>
            <Icon name="person_off" size={16} color={Colors.warning} />
            <Txt font="bold" size={10} color={Colors.warning} uppercase>
              Udeblevet
            </Txt>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function RequestCard({
  request,
  state,
  expanded,
  onToggle,
  onAccept,
  onAdjust,
  onReject,
}: {
  request: ShiftRequest;
  state: RequestState;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onAdjust: () => void;
  onReject: () => void;
}) {
  const pending = state === 'pending';
  return (
    <LinearGradient
      colors={RequestGradient.colors}
      locations={RequestGradient.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestIcon}>
          <Icon name="event_available" size={18} color={Colors.white} />
        </View>
        <View style={styles.flexShrink}>
          <Txt font="bold" size={15} color={Colors.white}>
            {request.place}
          </Txt>
          <Txt font="regular" size={12} color="rgba(255,255,255,0.85)">
            {request.date} · {request.time}
          </Txt>
        </View>
        {pending ? (
          <Pressable onPress={onToggle} hitSlop={8} style={styles.requestChevron}>
            <Icon
              name={expanded ? 'expand_less' : 'expand_more'}
              size={22}
              color={Colors.white}
            />
          </Pressable>
        ) : null}
      </View>

      {pending && expanded ? (
        <View style={styles.requestBody}>
          <View style={styles.requestDetails}>
            <View>
              <Txt
                font="bold"
                size={10}
                color="rgba(255,255,255,0.6)"
                tracking={0.6}
                uppercase>
                Lokation
              </Txt>
              <Txt
                font="semibold"
                size={13}
                color={Colors.white}
                style={styles.detailValue}>
                {request.loc}
              </Txt>
            </View>
            <View>
              <Txt
                font="bold"
                size={10}
                color="rgba(255,255,255,0.6)"
                tracking={0.6}
                uppercase>
                Pause
              </Txt>
              <Txt
                font="semibold"
                size={13}
                color={Colors.white}
                style={styles.detailValue}>
                {request.pause}
              </Txt>
            </View>
          </View>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptBtn,
              pressed && { opacity: 0.9 },
            ]}>
            <Txt font="bold" size={14} color={Colors.pinkDeep}>
              Acceptér
            </Txt>
          </Pressable>
          <View style={styles.secondaryGrid}>
            <Pressable
              onPress={onAdjust}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.8 },
              ]}>
              <Txt font="semibold" size={13} color={Colors.white}>
                Juster
              </Txt>
            </Pressable>
            <Pressable
              onPress={onReject}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.8 },
              ]}>
              <Txt font="semibold" size={13} color={Colors.white}>
                Afvis
              </Txt>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!pending ? (
        <View style={styles.requestDone}>
          <Icon
            name={state === 'accepted' ? 'check_circle' : 'cancel'}
            size={28}
            color={Colors.white}
          />
          <Txt font="bold" size={15} color={Colors.white}>
            {state === 'accepted' ? 'Vagt accepteret' : 'Vagt afvist'}
          </Txt>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function ReportButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.8 }]}>
      <View style={styles.reportIcon}>
        <Icon name={icon} size={24} color={Colors.lilac} />
      </View>
      <View style={styles.flex}>
        <Txt font="semibold" size={14} color={Colors.text}>
          {title}
        </Txt>
        <Txt
          font="regular"
          size={13}
          color={Colors.muted}
          style={styles.reportSub}>
          {subtitle}
        </Txt>
      </View>
      <Icon name="chevron_right" size={22} color={Colors.muted} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 28 },
  flex: { flex: 1 },
  flexShrink: { flex: 1, minWidth: 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  section: { gap: 0 },
  list: { gap: 14 },

  // Client rows (journal + status share the icon box)
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dangerBox: {
    backgroundColor: Alpha.dangerTint,
    borderColor: Alpha.dangerBorder,
  },
  warningBox: {
    backgroundColor: Alpha.warningTint,
    borderColor: Alpha.warningBorder,
  },
  clientRow: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientMeta: { marginTop: 1 },

  // Status item
  statusCard: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  doneBtn: {
    borderColor: Alpha.successBorder,
    backgroundColor: Alpha.successTint,
  },
  absentBtn: {
    borderColor: Alpha.warningBorder,
    backgroundColor: Alpha.warningTint,
  },

  // Request card
  requestCard: {
    borderRadius: Radius.xxl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requestIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestChevron: { padding: 2 },
  requestBody: { marginTop: 14 },
  requestDetails: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  detailValue: { marginTop: 2 },
  acceptBtn: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryGrid: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 9,
    alignItems: 'center',
  },
  requestDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  // Invoice
  invoiceCard: {
    borderRadius: Radius.xxl,
    padding: 16,
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  invoiceIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Alpha.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceSub: { marginTop: 2 },
  approveBtn: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 18,
    shadowColor: Colors.pink,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },

  // Report buttons
  reportBtn: {
    borderRadius: Radius.xxl,
    padding: 16,
    backgroundColor: Alpha.glass,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(194,194,249,0.12)',
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSub: { marginTop: 2 },
});
