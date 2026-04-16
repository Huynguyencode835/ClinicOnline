import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

const generateSlots = (fromHour, toHour, duration = 60, step = 15) => {
  const slots = [];
  let startMinutes = fromHour * 60;
  const limitMinutes = toHour * 60;

  const fmt = (m) => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    return `${h}:${min}`;
  };

  while (startMinutes + duration <= limitMinutes) {
    const endMinutes = startMinutes + duration;
    slots.push({
      start: fmt(startMinutes),
      end: fmt(endMinutes),
      label: `${fmt(startMinutes)} - ${fmt(endMinutes)}`,
    });
    startMinutes += step;
  }
  return slots;
};

const SLOTS = {
  morning: generateSlots(6, 12),
  afternoon: generateSlots(12, 18),
  evening: generateSlots(18, 22),
};

const TimeSlot = ({ shift, selectedSlots = [], onSlotsChange }) => {
  const slots = SLOTS[shift];

  const isSelected = (slot) =>
    selectedSlots.some(s => s.start === slot.start && s.end === slot.end);

  const handlePress = (slot) => {
    if (isSelected(slot)) {
      onSlotsChange(
        selectedSlots.filter(s => !(s.start === slot.start && s.end === slot.end))
      );
    } else {
      onSlotsChange([...selectedSlots, { start: slot.start, end: slot.end }]);
    }
  };

  return (
    <View>
      <Text variant="labelSmall" style={styles.label}>
        Chọn khung giờ {selectedSlots.length > 0 && `(${selectedSlots.length} đã chọn)`}
      </Text>
      <View style={styles.row}>
        {slots.map(slot => (
          <Chip
            key={slot.label}
            selected={isSelected(slot)}
            onPress={() => handlePress(slot)}
            style={[styles.chip, isSelected(slot) && styles.selected]}
            textStyle={[styles.text, isSelected(slot) && styles.textSel]}
            showSelectedCheck={false}
          >
            {slot.label}
          </Chip>
        ))}
      </View>
    </View>
  );
};

export default TimeSlot;

const styles = StyleSheet.create({
  label: { color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  selected: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  text: { fontSize: 12, color: '#64748b' },
  textSel: { color: '#1d4ed8', fontWeight: '600' },
});