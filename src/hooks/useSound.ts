import {useCallback, useEffect, useRef} from 'react';
import {Vibration} from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

type SoundName = 'beep' | 'start' | 'bell';

function loadSound(filename: string): Sound {
  return new Sound(filename, Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.warn('Failed to load sound ' + filename, error);
    }
  });
}

function play(sound: Sound | null) {
  if (!sound) return;
  sound.stop(() => {
    sound.play();
  });
}

export function useSound() {
  const sounds = useRef<Record<SoundName, Sound | null>>({
    beep: null,
    start: null,
    bell: null,
  });

  useEffect(() => {
    sounds.current.beep = loadSound('beep.wav');
    sounds.current.start = loadSound('start.wav');
    sounds.current.bell = loadSound('bell.wav');

    return () => {
      sounds.current.beep?.release();
      sounds.current.start?.release();
      sounds.current.bell?.release();
    };
  }, []);

  const playBeep = useCallback(() => {
    play(sounds.current.beep);
    Vibration.vibrate(60);
  }, []);

  const playStart = useCallback(() => {
    play(sounds.current.start);
    Vibration.vibrate([0, 80, 60, 80]);
  }, []);

  const playBell = useCallback(() => {
    play(sounds.current.bell);
    Vibration.vibrate(400);
  }, []);

  return {playBeep, playStart, playBell};
}
