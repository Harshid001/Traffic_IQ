import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { CollapsedRouteSheet } from './CollapsedRouteSheet';
import { ExpandedRouteSheet } from './ExpandedRouteSheet';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const BottomSheetContainerBase: React.FC = () => {
  const bottomSheetExpanded = useNavigationStore(s => s.bottomSheetExpanded);
  const setBottomSheetExpanded = useNavigationStore(s => s.setBottomSheetExpanded);
  const routingData = useNavigationStore(s => s.routingData);

  if (!routingData || !routingData.routes.length) return null;

  return (
    <View style={styles.container}>
      {bottomSheetExpanded ? (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setBottomSheetExpanded(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setBottomSheetExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Collapse route details"
          >
            <Pressable accessible={false} style={styles.modalSheet} onPress={() => {}}>
              <ExpandedRouteSheet />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        <CollapsedRouteSheet />
      )}
    </View>
  );
};

export const BottomSheetContainer = React.memo(BottomSheetContainerBase);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 82,
    left: 0,
    right: 0,
    zIndex: 25
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radius.xxl,
    borderTopRightRadius: spacing.radius.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16
  }
});
