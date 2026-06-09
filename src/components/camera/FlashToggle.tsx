import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export const FlashToggle: React.FC<Props> = ({ enabled, onToggle }) => (
  <TouchableOpacity
    style={[styles.btn, enabled && styles.btnActive]}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <Ionicons
      name={enabled ? 'flash' : 'flash-off'}
      size={24}
      color={enabled ? Colors.background : Colors.text}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: { backgroundColor: Colors.accent },
});
