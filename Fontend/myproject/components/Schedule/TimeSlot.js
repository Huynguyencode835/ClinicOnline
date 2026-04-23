import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';


const TimeSlot = ({ shift, selectedSlots, onSlotsChange, SLOTS, multiple = true }) => {
  const slots = SLOTS[shift];

  const isSelected = (slot) => {
  if (multiple) {
    return selectedSlots?.some(
      s => s.start === slot.start && s.end === slot.end
    );
  } else {
    return selectedSlots &&
      selectedSlots.start === slot.start &&
      selectedSlots.end === slot.end;
  }
};

  const handlePress = (slot) => {
  const exists = isSelected(slot);

  if (multiple) {
    if (exists) {
      onSlotsChange(
        selectedSlots.filter(
          s => !(s.start === slot.start && s.end === slot.end)
        )
      );
    } else {
      onSlotsChange([
        ...selectedSlots,
        { start: slot.start, end: slot.end }
      ]);
    }
  } else {
    if (exists) {
      onSlotsChange(null); // bỏ chọn
    } else {
      onSlotsChange({ start: slot.start, end: slot.end }); // chỉ 1 slot
    }
  }
};



  return (
    <View>
      <Text variant="labelSmall" style={styles.label}>
        Chọn khung giờ
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