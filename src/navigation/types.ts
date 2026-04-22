import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * Central definition of every screen in the app and the params they accept.
 * Add params here as screens are built out; screens with no params use `undefined`.
 */
export type RootStackParamList = {
  Home: undefined;
  Timer: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Augment the @react-navigation type definitions so hooks like
// useNavigation() are typed automatically throughout the app.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
