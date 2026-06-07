import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {store, persistor} from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';
import {navigationRef} from './src/navigation/navigationRef';
import ErrorBoundary from './src/components/ErrorBoundary';
import {Colors} from './src/constants';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
