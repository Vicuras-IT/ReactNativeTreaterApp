import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DesignBackground,
  Divider,
  GlassCard,
  Icon,
  PinkButton,
  PillTabs,
  Toggle,
  Txt,
  useToast,
} from '@/components/ui';
import { Alpha, Colors, Radius } from '@/theme';

type MatTab = 'order' | 'linen' | 'room';
type CatKey = 'olie' | 'sanitet' | 'engangs' | 'ovrige';
type OilKind = 'neutral' | 'opkvikkende';

const KUNDE_OPTS = ['Novo Nordisk', 'Region Hovedstaden'];
const LOKATION_OPTS = ['Bagsværd – Bygning 9F', 'Måløv – Site B', 'Hillerød Hospital'];

const SANITET_ITEMS = [
  'Håndsprit',
  'Vådservietter',
  'Engangshandsker',
  'Affaldsposer',
  'Overfladespray',
];

const ENGANGS_ITEMS: { icon: string; label: string }[] = [
  { icon: 'content_cut', label: 'Lagner (papir)' },
  { icon: 'dry_cleaning', label: 'Ansigtsservietter' },
];

const OVRIGE_ITEMS = [
  'Massagebolster',
  'Nakkepude',
  'Plejecreme',
  'Bomuldsruller',
  'Spritservietter',
  'Andet',
];

const ROOM_CHECKS: { key: string; icon: string; label: string }[] = [
  { key: 'toilet', icon: 'wc', label: 'Toilet er rent og funktionsdygtigt' },
  { key: 'reception', icon: 'concierge', label: 'Reception er bemandet ved ankomst' },
  { key: 'rum', icon: 'meeting_room', label: 'Behandlingsrum er klargjort' },
  { key: 'parkering', icon: 'local_parking', label: 'Parkering er tilgængelig' },
  { key: 'wifi', icon: 'wifi', label: 'WiFi virker' },
  { key: 'rengoring', icon: 'cleaning_services', label: 'Rengøring er udført' },
];

export function OrderMaterialsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [tab, setTab] = useState<MatTab>('order');

  return (
    <DesignBackground>
      {/* Back header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}>
          <Icon name="arrow_back" size={20} color={Colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Txt font="displayBold" size={19} color={Colors.text}>
            Materialer
          </Txt>
          <Txt font="bold" size={10.5} color={Colors.muted} tracking={0.6} uppercase>
            Healthcare Practitioner Portal
          </Txt>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Txt font="displayBold" size={26} color={Colors.text} lineHeight={30}>
            Behandlerlokale og materialer
          </Txt>
        </View>

        <PillTabs<MatTab>
          tabs={[
            { key: 'order', label: 'Bestilling' },
            { key: 'linen', label: 'Linned' },
            { key: 'room', label: 'Lokale' },
          ]}
          selected={tab}
          onSelect={setTab}
          scroll
        />

        {tab === 'order' ? <OrderPanel toast={toast} /> : null}
        {tab === 'linen' ? <LinenPanel toast={toast} /> : null}
        {tab === 'room' ? <RoomPanel toast={toast} /> : null}
      </ScrollView>
    </DesignBackground>
  );
}

/* ------------------------------------------------------------------ */
/* Bestilling                                                          */
/* ------------------------------------------------------------------ */

function OrderPanel({ toast }: { toast: { show: (m: string) => void } }) {
  const [kunde, setKunde] = useState(KUNDE_OPTS[0]);
  const [lokation, setLokation] = useState(LOKATION_OPTS[0]);
  const [lokale, setLokale] = useState('');

  const [open, setOpen] = useState<Record<CatKey, boolean>>({
    olie: true,
    sanitet: false,
    engangs: false,
    ovrige: false,
  });
  const toggle = (k: CatKey) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const [oilKind, setOilKind] = useState<OilKind>('neutral');
  const [oilQty, setOilQty] = useState('');
  const [sanitet, setSanitet] = useState<Record<string, boolean>>({});
  const [engangsQty, setEngangsQty] = useState<Record<string, string>>({});
  const [ovrige, setOvrige] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.panel}>
      <BestillingCard
        title="Opret ny bestilling"
        kunde={kunde}
        onKunde={setKunde}
        lokation={lokation}
        onLokation={setLokation}
        lokale={lokale}
        onLokale={setLokale}
      />

      <GlassCard padding={16} radius={Radius.xl}>
        <View style={styles.sectionGap}>
          <View>
            <View style={styles.pinkTick} />
            <Txt font="display" size={18} color={Colors.text}>
              Vælg kategorier
            </Txt>
          </View>

          {/* Olie */}
          <Accordion icon="oil_barrel" label="Olie" open={open.olie} onToggle={() => toggle('olie')}>
            <SubLabel>Vælg artikel</SubLabel>
            <View style={styles.rowGap8}>
              <ChoicePill
                label="Neutral"
                active={oilKind === 'neutral'}
                onPress={() => setOilKind('neutral')}
              />
              <ChoicePill
                label="Opkvikkende"
                active={oilKind === 'opkvikkende'}
                onPress={() => setOilKind('opkvikkende')}
              />
            </View>
            <FieldLabel>Angiv nuværende antal (stk)</FieldLabel>
            <TextInput
              value={oilQty}
              onChangeText={setOilQty}
              placeholder="0"
              placeholderTextColor={Colors.faint}
              keyboardType="number-pad"
              style={styles.pillInput}
            />
          </Accordion>

          {/* Sanitet — multi-select checkboxes */}
          <Accordion
            icon="sanitizer"
            label="Sanitet"
            open={open.sanitet}
            onToggle={() => toggle('sanitet')}>
            {SANITET_ITEMS.map((name) => {
              const selected = !!sanitet[name];
              return (
                <Pressable
                  key={name}
                  onPress={() => setSanitet((p) => ({ ...p, [name]: !p[name] }))}
                  style={styles.itemRow}>
                  <Txt font="medium" size={14} color={Colors.text}>
                    {name}
                  </Txt>
                  <View
                    style={[
                      styles.checkbox,
                      selected && { backgroundColor: Colors.pink, borderColor: Colors.pink },
                    ]}>
                    {selected ? <Icon name="check" size={14} color={Colors.onPink} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Accordion>

          {/* Engangslinned — quantity steppers */}
          <Accordion
            icon="content_cut"
            label="Engangslinned"
            open={open.engangs}
            onToggle={() => toggle('engangs')}>
            <SubLabel>Vælg type</SubLabel>
            {ENGANGS_ITEMS.map((e) => (
              <View key={e.label} style={styles.engangsRow}>
                <View style={styles.rowCenter}>
                  <Icon name={e.icon} size={18} color={Colors.pink} />
                  <Txt font="semibold" size={14} color={Colors.text}>
                    {e.label}
                  </Txt>
                </View>
                <FieldLabel>Angiv nuværende antal (stk)</FieldLabel>
                <Stepper
                  value={engangsQty[e.label] ?? ''}
                  onChange={(v) => setEngangsQty((p) => ({ ...p, [e.label]: v }))}
                />
              </View>
            ))}
          </Accordion>

          {/* Øvrige */}
          <Accordion
            icon="more_horiz"
            label="Øvrige"
            open={open.ovrige}
            onToggle={() => toggle('ovrige')}>
            {OVRIGE_ITEMS.map((name) => {
              const selected = !!ovrige[name];
              return (
                <View key={name} style={styles.itemRow}>
                  <Txt font="medium" size={14} color={Colors.text}>
                    {name}
                  </Txt>
                  <Pressable
                    onPress={() => setOvrige((p) => ({ ...p, [name]: !p[name] }))}
                    style={[styles.choosePill, selected && styles.choosePillActive]}>
                    <Txt
                      font="bold"
                      size={11}
                      color={selected ? Colors.onPink : Colors.muted}
                      uppercase>
                      {selected ? 'Valgt' : 'Vælg'}
                    </Txt>
                  </Pressable>
                </View>
              );
            })}
          </Accordion>

          <Divider />

          <View>
            <View style={styles.pinkTick} />
            <Txt font="display" size={16} color={Colors.text}>
              Noter til bestilling
            </Txt>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Tilføj instruktioner til levering…"
            placeholderTextColor={Colors.faint}
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />

          <PinkButton
            label="Send bestilling"
            icon="send"
            expand
            onPress={() => toast.show('Bestilling sendt')}
          />
        </View>
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Linned                                                              */
/* ------------------------------------------------------------------ */

function LinenPanel({ toast }: { toast: { show: (m: string) => void } }) {
  const [kunde, setKunde] = useState(KUNDE_OPTS[0]);
  const [lokation, setLokation] = useState(LOKATION_OPTS[0]);
  const [lokale, setLokale] = useState('');

  const [matches, setMatches] = useState<boolean | null>(null);
  const [actual, setActual] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<number[]>([]);

  const expected = 100;

  return (
    <View style={styles.panel}>
      <BestillingCard
        title="Opret ny bestilling"
        kunde={kunde}
        onKunde={setKunde}
        lokation={lokation}
        onLokation={setLokation}
        lokale={lokale}
        onLokale={setLokale}
      />

      <GlassCard padding={16} radius={Radius.xl}>
        <View style={styles.cardGap14}>
          <View style={styles.rowCenter}>
            <View style={styles.iconBadge}>
              <Icon name="photo_camera" size={20} color={Colors.pink} />
            </View>
            <View style={styles.flex}>
              <Txt font="display" size={16} color={Colors.text}>
                Indmeld status på beholdning
              </Txt>
              <Txt font="regular" size={12} color={Colors.muted}>
                Tag billede af lagenbundterne
              </Txt>
            </View>
          </View>

          {/* Forventet beholdning */}
          <View style={styles.expectedBox}>
            <View style={styles.spaceBetween}>
              <View style={styles.flex}>
                <Txt font="bold" size={10} color={Colors.muted} tracking={0.6} uppercase>
                  Forventet beholdning
                </Txt>
                <Txt font="regular" size={12.5} color={Colors.muted} style={{ marginTop: 4 }}>
                  Vores estimat for lokationen
                </Txt>
              </View>
              <View style={styles.rowBaseline}>
                <Txt font="displayExtrabold" size={30} color={Colors.pink}>
                  {expected}
                </Txt>
                <Txt font="semibold" size={13} color={Colors.muted}>
                  {' '}
                  lagner
                </Txt>
              </View>
            </View>

            <Txt font="bold" size={12} color={Colors.text} style={styles.matchQ}>
              Stemmer det med beholdningen?
            </Txt>
            <View style={styles.rowGap8}>
              <YesNoButton
                label="Ja"
                icon="check"
                active={matches === true}
                tone="success"
                onPress={() => setMatches(true)}
              />
              <YesNoButton
                label="Nej"
                icon="close"
                active={matches === false}
                tone="danger"
                onPress={() => setMatches(false)}
              />
            </View>

            {matches === false ? (
              <View style={styles.fieldGap}>
                <FieldLabel>Hvor mange er der så?</FieldLabel>
                <TextInput
                  value={actual}
                  onChangeText={setActual}
                  placeholder="Angiv faktisk antal"
                  placeholderTextColor={Colors.faint}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            ) : null}
          </View>

          {/* Photo upload grid */}
          <Pressable
            onPress={() => setPhotos((p) => [...p, Date.now()])}
            style={styles.dropzone}>
            <Icon name="add_a_photo" size={28} color={Colors.pink} />
            <Txt font="semibold" size={13} color={Colors.text}>
              Tilføj billede(r)
            </Txt>
            <Txt font="regular" size={11} color={Colors.muted}>
              Du kan uploade flere billeder
            </Txt>
          </Pressable>

          {photos.length > 0 ? (
            <View>
              <FieldLabel>Tilføjede billeder ({photos.length})</FieldLabel>
              <View style={styles.photoGrid}>
                {photos.map((id) => (
                  <View key={id} style={styles.photoTile}>
                    <Icon name="image" size={22} color={Colors.muted} />
                    <Pressable
                      onPress={() => setPhotos((p) => p.filter((x) => x !== id))}
                      style={styles.photoRemove}
                      hitSlop={6}>
                      <Icon name="close" size={14} color={Colors.white} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Status comment */}
          <View style={styles.fieldGap}>
            <FieldLabel>Kommentar</FieldLabel>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Tilføj en kommentar til statussen…"
              placeholderTextColor={Colors.faint}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </View>

          <PinkButton
            label="Indmeld status"
            expand
            onPress={() => toast.show('Status gemt')}
          />
        </View>
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Lokale                                                              */
/* ------------------------------------------------------------------ */

function RoomPanel({ toast }: { toast: { show: (m: string) => void } }) {
  const [kunde, setKunde] = useState(KUNDE_OPTS[0]);
  const [lokation, setLokation] = useState(LOKATION_OPTS[0]);
  const [lokale, setLokale] = useState('');

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState('');

  return (
    <View style={styles.panel}>
      <BestillingCard
        title="Hvor laver du status?"
        kunde={kunde}
        onKunde={setKunde}
        lokation={lokation}
        onLokation={setLokation}
        lokale={lokale}
        onLokale={setLokale}
      />

      <GlassCard padding={16} radius={Radius.xl}>
        <View style={styles.cardGap14}>
          <View style={styles.rowCenter}>
            <View style={styles.iconBadge}>
              <Icon name="fact_check" size={20} color={Colors.pink} />
            </View>
            <View style={styles.flex}>
              <Txt font="display" size={16} color={Colors.text}>
                Dokumentér lokalets tilstand
              </Txt>
              <Txt font="regular" size={12} color={Colors.muted} lineHeight={16}>
                Ved ankomst, afrejse eller ved et hul i løbet af behandlingsdagen
              </Txt>
            </View>
          </View>

          <FieldLabel>Tjek standarder</FieldLabel>
          <View style={styles.checklist}>
            {ROOM_CHECKS.map((ch) => (
              <View key={ch.key} style={styles.checkRow}>
                <Icon name={ch.icon} size={20} color={Colors.pink} />
                <Txt font="medium" size={12.5} color={Colors.text} style={styles.flex} lineHeight={17}>
                  {ch.label}
                </Txt>
                <Toggle
                  value={!!checks[ch.key]}
                  onChange={(next) => setChecks((p) => ({ ...p, [ch.key]: next }))}
                  small
                />
              </View>
            ))}
          </View>

          <View style={styles.fieldGap}>
            <FieldLabel>Kommentar til lokalestatus</FieldLabel>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Beskriv eventuelle observationer eller mangler…"
              placeholderTextColor={Colors.faint}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </View>

          <PinkButton
            label="Afgiv status"
            expand
            onPress={() => toast.show('Status gemt')}
          />
        </View>
      </GlassCard>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-components                                               */
/* ------------------------------------------------------------------ */

/** Top "create" card with Kunde / Lokation dropdowns + a Lokale field. */
function BestillingCard({
  title,
  kunde,
  onKunde,
  lokation,
  onLokation,
  lokale,
  onLokale,
}: {
  title: string;
  kunde: string;
  onKunde: (v: string) => void;
  lokation: string;
  onLokation: (v: string) => void;
  lokale: string;
  onLokale: (v: string) => void;
}) {
  return (
    <View style={styles.createCard}>
      <View style={styles.createAccent} />
      <View style={styles.createInner}>
        <Txt font="displayBold" size={18} color={Colors.text}>
          {title}
        </Txt>

        <View style={styles.prefill}>
          <Icon name="auto_awesome" size={18} color={Colors.pink} />
          <Txt font="regular" size={12} color={Colors.text} style={styles.flex}>
            Forudfyldt fra din vagt på Novo Nordisk
          </Txt>
        </View>

        <Dropdown label="Kunde" value={kunde} options={KUNDE_OPTS} onSelect={onKunde} />
        <Dropdown
          label="Lokation"
          value={lokation}
          options={LOKATION_OPTS}
          onSelect={onLokation}
        />

        <View style={styles.fieldGap}>
          <FieldLabel>Lokale</FieldLabel>
          <TextInput
            value={lokale}
            onChangeText={onLokale}
            placeholder="F.eks. Operationsstue 4"
            placeholderTextColor={Colors.faint}
            style={styles.input}
          />
        </View>
      </View>
    </View>
  );
}

/** Tappable dropdown field — cycles through options on press. */
function Dropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const onPress = () => {
    const idx = options.indexOf(value);
    onSelect(options[(idx + 1) % options.length]);
  };
  return (
    <View style={styles.fieldGap}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable onPress={onPress} style={styles.dropdown}>
        <Txt font="medium" size={14} color={Colors.text} style={styles.flex} numberOfLines={1}>
          {value}
        </Txt>
        <Icon name="expand_more" size={20} color={Colors.muted} />
      </Pressable>
    </View>
  );
}

/** Collapsible category accordion. */
function Accordion({
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  icon: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.accordion}>
      <Pressable onPress={onToggle} style={styles.accordionHead}>
        <View style={styles.rowCenter}>
          <Icon name={icon} size={20} color={Colors.pink} />
          <Txt font="bold" size={14} color={Colors.text}>
            {label}
          </Txt>
        </View>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} color={Colors.muted} />
      </Pressable>
      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

/** Pink quantity stepper (− value +). */
function Stepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const num = parseInt(value || '0', 10) || 0;
  const set = (n: number) => onChange(String(Math.max(0, n)));
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => set(num - 1)} style={styles.stepBtn} hitSlop={6}>
        <Icon name="remove" size={18} color={Colors.text} />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        placeholder="0"
        placeholderTextColor={Colors.faint}
        keyboardType="number-pad"
        style={styles.stepInput}
      />
      <Pressable onPress={() => set(num + 1)} style={styles.stepBtn} hitSlop={6}>
        <Icon name="add" size={18} color={Colors.text} />
      </Pressable>
    </View>
  );
}

function ChoicePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choicePill, active && styles.choicePillActive]}>
      <Txt font="semibold" size={13} color={active ? Colors.onPink : Colors.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

function YesNoButton({
  label,
  icon,
  active,
  tone,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  tone: 'success' | 'danger';
  onPress: () => void;
}) {
  const accent = tone === 'success' ? Colors.success : Colors.danger;
  const bg = tone === 'success' ? Alpha.successTint : Alpha.dangerTint;
  const border = tone === 'success' ? Alpha.successBorder : Alpha.dangerBorder;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.yesNo,
        active
          ? { backgroundColor: bg, borderColor: border }
          : { backgroundColor: Alpha.glass, borderColor: Alpha.hairline },
      ]}>
      <Icon name={icon} size={18} color={active ? accent : Colors.muted} />
      <Txt font="bold" size={13} color={active ? accent : Colors.muted}>
        {label}
      </Txt>
    </Pressable>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <Txt font="bold" size={11} color={Colors.muted} tracking={0.5} uppercase>
      {children}
    </Txt>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Txt font="bold" size={10} color={Colors.muted} tracking={1} uppercase>
      {children}
    </Txt>
  );
}

const inputBase: TextStyle = {
  backgroundColor: Colors.inputBg,
  borderWidth: 1,
  borderColor: 'rgba(160,172,255,0.16)',
  paddingHorizontal: 16,
  paddingVertical: 13,
  color: Colors.text,
  fontFamily: 'Manrope_500Medium',
  fontSize: 14,
};

const styles = StyleSheet.create({
  flex: { flex: 1, flexShrink: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  headerTitles: { flexShrink: 1, gap: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 16 },
  intro: { marginBottom: 4 },

  panel: { gap: 16 },

  // "Create" card (gradient-ish glass with pink accent bar)
  createCard: {
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(191,194,255,0.2)',
    backgroundColor: 'rgba(13,19,64,0.92)',
  },
  createAccent: {
    height: 3,
    width: 56,
    backgroundColor: Colors.pink,
    borderBottomRightRadius: 6,
  },
  createInner: { padding: 18, gap: 16 },
  prefill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(217,74,230,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.25)',
  },

  fieldGap: { gap: 6 },
  dropdown: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(160,172,255,0.16)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  input: { ...inputBase, borderRadius: Radius.md },
  pillInput: { ...inputBase, borderRadius: Radius.pill, paddingVertical: 10 },
  textarea: {
    ...inputBase,
    borderRadius: Radius.md,
    paddingVertical: 14,
    minHeight: 84,
    textAlignVertical: 'top',
  },

  sectionGap: { gap: 20 },
  cardGap14: { gap: 14 },
  pinkTick: {
    height: 2,
    width: 48,
    backgroundColor: Colors.pink,
    borderRadius: Radius.pill,
    marginBottom: 12,
  },

  // Accordions
  accordion: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 10,
  },
  accordionHead: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },

  rowGap8: { flexDirection: 'row', gap: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  choicePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Alpha.hairlineSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  choicePillActive: { backgroundColor: Colors.pink, borderColor: Colors.pink },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(45,50,84,0.2)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Alpha.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choosePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  choosePillActive: { backgroundColor: Colors.pink, borderColor: Colors.pink },

  engangsRow: {
    gap: 8,
    padding: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(45,50,84,0.2)',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInput: {
    ...inputBase,
    flex: 1,
    textAlign: 'center',
    borderRadius: Radius.pill,
    paddingVertical: 9,
  },

  // Linned
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(217,74,230,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expectedBox: {
    borderRadius: Radius.md,
    padding: 16,
    backgroundColor: 'rgba(217,74,230,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(217,74,230,0.2)',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowBaseline: { flexDirection: 'row', alignItems: 'baseline' },
  matchQ: { marginTop: 14, marginBottom: 8 },
  yesNo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },

  dropzone: {
    borderRadius: Radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(214,51,224,0.4)',
    backgroundColor: '#10153F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  photoTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Alpha.hairline,
    backgroundColor: '#10153F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(8,11,40,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lokale
  checklist: { gap: 8 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});
