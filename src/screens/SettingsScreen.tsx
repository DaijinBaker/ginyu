import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Typography} from '../constants';
import {useAppSelector} from '../hooks/useAppStore';

export default function SettingsScreen() {
  const config = useAppSelector(state => state.session.config);

  return (
    <View style={styles.container}>
      <Text style={Typography.h3}>Session Config</Text>
      <View style={styles.row}>
        <Text style={Typography.bodySmall}>Rounds</Text>
        <Text style={Typography.body}>{config.rounds}</Text>
      </View>
      <View style={styles.row}>
        <Text style={Typography.bodySmall}>Round duration</Text>
        <Text style={Typography.body}>{config.roundDuration}s</Text>
      </View>
      <View style={styles.row}>
        <Text style={Typography.bodySmall}>Rest duration</Text>
        <Text style={Typography.body}>{config.restDuration}s</Text>
      </View>
      <View style={styles.row}>
        <Text style={Typography.bodySmall}>Prep time</Text>
        <Text style={Typography.body}>{config.prepDuration}s</Text>
      </View>
      <View style={styles.row}>
        <Text style={Typography.bodySmall}>Warning time</Text>
        <Text style={Typography.body}>{config.warningTime}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey800,
  },
});
