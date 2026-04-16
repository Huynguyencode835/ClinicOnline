import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  text: {
    fontSize: 14,
    color: '#1a1a2e',
  },

  smallText: {
    fontSize: 12,
    color: '#64748b',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
  },

  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 14,
  },

  secondaryButton: {
    backgroundColor: '#EAF4FF',
    borderRadius: 14,
  },

  outlineButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e8',
  },

  listContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
    gap: 10,
    paddingBottom: 8,
  },
});