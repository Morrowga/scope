import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, Modal, Pressable, View } from 'react-native';

interface SwipeableSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  bottomInset?: number;
}

export const SwipeableSheet: React.FC<SwipeableSheetProps> = ({
  visible, onClose, children, bottomInset = 0,
}) => {
  const translateY = useRef(new Animated.Value(600)).current;

  // Animate in when visible becomes true
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(600);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 80 || vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"        // ← key fix: no built-in animation
      onRequestClose={dismiss}
    >
      <Pressable style={overlayStyle} onPress={dismiss}>
        <Pressable>
          <Animated.View
            style={[
              sheetStyle,
              { paddingBottom: bottomInset + 24 },
              { transform: [{ translateY }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={handleStyle} />
            {children}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const overlayStyle = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'flex-end' as const,
};

const sheetStyle = {
  backgroundColor: '#0a0a0a',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderTopWidth: 0.5,
  borderColor: '#1a1a1a',
  paddingHorizontal: 20,
  paddingTop: 12,
};

const handleStyle = {
  width: 36,
  height: 3,
  backgroundColor: '#333',
  borderRadius: 2,
  alignSelf: 'center' as const,
  marginBottom: 20,
};