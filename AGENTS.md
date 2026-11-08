@../AGENTS-shared.md

# ginyu

Boxing round timer with Dragon Ball transformation intensity levels.

## Stack

- Bare React Native 0.85.1 (no Expo)
- TypeScript 5.8
- Redux Toolkit + redux-persist (state home)
- react-navigation native-stack
- Native: Android foreground service (@supersami/rn-foreground-service),
  wake lock (@sayem314/react-native-keep-awake), react-native-sound,
  video/GIF assets

## Commands

- typecheck: `npm run type-check`
- lint: `npm run lint`
- test: `npm run test`
- run on emulator: `npm run android` (Metro on port 8082)

## Landmines

- Timer logic lives in `src/hooks/useTimer.ts`.
- Foreground-service lifecycle changes must stay paired with
  AndroidManifest edits.
