import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Typography} from '../constants';
import {useAppSelector} from '../hooks/useAppStore';

export default function HistoryScreen() {
  const sessions = useAppSelector(state => state.history.sessions);

  return (
    <View style={styles.container}>
      {sessions.length === 0 ? (
        <Text style={Typography.bodySmall}>No sessions yet. Get to work.</Text>
      ) : (
        <Text style={Typography.body}>{sessions.length} sessions completed</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});
