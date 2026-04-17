import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

const DAYS = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];

const DaychipGroup = ({ selected, onToggle}) => {
    return (
    <View style={styles.row}>
      {DAYS.map((label, i) => (
        <Chip
          key={i}
          selected={selected === i}
          onPress={() => onToggle(i)}
          style={[
            styles.chip,
            selected === i  && styles.chipSelected,
          ]}
          textStyle={[
            styles.text,
            selected === i && styles.textSelected,
          ]}
          showSelectedCheck={false}
          compact
        >
          {label}
        </Chip>
      ))}
    </View>
  );
}

export default DaychipGroup;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  text: {
    fontSize: 12,
    color: '#64748b',
  },
  textSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});