import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parse } from 'date-fns';
import { ItineraryItem, NewItineraryItem } from '@/hooks/useItineraryActions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  dayId: string;
  existingItems: ItineraryItem[];
  onAdd: (dayId: string, item: NewItineraryItem) => Promise<ItineraryItem | null>;
};

type FormState = {
  title: string;
  location: string;
  description: string;
  start_time: string; // 'HH:mm' or ''
  end_time: string;   // 'HH:mm' or ''
};

type TimePickerTarget = 'start_time' | 'end_time' | null;

const EMPTY_FORM: FormState = {
  title: '',
  location: '',
  description: '',
  start_time: '',
  end_time: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AddItemModal = ({ visible, onClose, dayId, existingItems, onAdd }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Open/close sheet in response to visible prop
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }, [onClose]);

  // ─── Field helpers ───────────────────────────────────────────────────────

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ─── Time picker ─────────────────────────────────────────────────────────

  const openTimePicker = (target: TimePickerTarget) => setTimePickerTarget(target);
  const closeTimePicker = () => setTimePickerTarget(null);

  const handleTimeConfirm = (date: Date) => {
    if (!timePickerTarget) return;
    const formatted = format(date, 'HH:mm');
    setField(timePickerTarget, formatted);
    closeTimePicker();
  };

  // Parse existing time string back to a Date for the picker's initial value
  const pickerDate = (() => {
    if (!timePickerTarget) return new Date();
    const existing = form[timePickerTarget];
    if (!existing) return new Date();
    try {
      return parse(existing, 'HH:mm', new Date());
    } catch {
      return new Date();
    }
  })();

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.title.trim()) newErrors.title = 'Activity name is required';

    if (form.start_time && form.end_time) {
      const [sh, sm] = form.start_time.split(':').map(Number);
      const [eh, em] = form.end_time.split(':').map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const result = await onAdd(dayId, {
        title: form.title.trim(),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      });

      if (result) handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['75%', '92%']}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Activity</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <FormField label="Activity Name" required error={errors.title}>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g. Lunch at Nobu"
              placeholderTextColor="#BBBBBB"
              value={form.title}
              onChangeText={v => setField('title', v)}
              returnKeyType="next"
              autoFocus
            />
          </FormField>

          {/* Location */}
          <FormField label="Location">
            <TextInput
              style={styles.input}
              placeholder="e.g. 105 Hudson St, New York"
              placeholderTextColor="#BBBBBB"
              value={form.location}
              onChangeText={v => setField('location', v)}
              returnKeyType="next"
            />
          </FormField>

          {/* Times — side by side */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField label="Start Time" error={errors.start_time}>
                <TimePressable
                  value={form.start_time}
                  placeholder="09:00 AM"
                  onPress={() => openTimePicker('start_time')}
                  hasError={!!errors.start_time}
                />
              </FormField>
            </View>
            <View style={styles.rowSpacer} />
            <View style={{ flex: 1 }}>
              <FormField label="End Time" error={errors.end_time}>
                <TimePressable
                  value={form.end_time}
                  placeholder="10:00 AM"
                  onPress={() => openTimePicker('end_time')}
                  hasError={!!errors.end_time}
                />
              </FormField>
            </View>
          </View>

          {/* Description */}
          <FormField label="Notes">
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any details, reminders, or links..."
              placeholderTextColor="#BBBBBB"
              value={form.description}
              onChangeText={v => setField('description', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Add Activity</Text>
            )}
          </TouchableOpacity>

          {/* Bottom safe area padding */}
          <View style={{ height: 24 }} />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Time Picker — rendered outside sheet to avoid z-index issues */}
      {/* <DateTimePickerModal
        isVisible={timePickerTarget !== null}
        mode="time"
        date={pickerDate}
        onConfirm={handleTimeConfirm}
        onCancel={closeTimePicker}
        is24Hour={false}
        minuteInterval={5}
      /> */}
    </>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

const FormField = ({ label, required, error, children }: FormFieldProps) => (
  <View style={styles.fieldContainer}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredDot}>*</Text>}
    </View>
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

type TimePressableProps = {
  value: string;
  placeholder: string;
  onPress: () => void;
  hasError?: boolean;
};

const TimePressable = ({ value, placeholder, onPress, hasError }: TimePressableProps) => {
  const displayValue = value
    ? format(parse(value, 'HH:mm', new Date()), 'hh:mm a')
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.input,
        styles.timePressable,
        hasError && styles.inputError,
        pressed && styles.timePressablePressed,
      ]}
    >
      <Text style={displayValue ? styles.timeValue : styles.timePlaceholder}>
        {displayValue ?? placeholder}
      </Text>
      <Text style={styles.clockIcon}>🕐</Text>
    </Pressable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT_BG = '#F5F5F5';
const BORDER_COLOR = '#EBEBEB';
const ERROR_COLOR = '#E53E3E';
const PRIMARY = '#1A1A1A';
const LABEL_COLOR = '#555555';

const styles = StyleSheet.create({
  handle: {
    backgroundColor: '#DDDDDD',
    width: 36,
  },
  sheetBg: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  closeBtn: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },

  // Fields
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: LABEL_COLOR,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredDot: {
    fontSize: 13,
    color: ERROR_COLOR,
    fontWeight: '700',
  },

  // Input
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: PRIMARY,
  },
  inputError: {
    borderColor: ERROR_COLOR,
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: ERROR_COLOR,
  },

  // Row layout for times
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowSpacer: {
    width: 12,
  },

  // Time pressable
  timePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePressablePressed: {
    opacity: 0.7,
  },
  timeValue: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '500',
  },
  timePlaceholder: {
    fontSize: 15,
    color: '#BBBBBB',
  },
  clockIcon: {
    fontSize: 14,
  },

  // Submit
  submitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});