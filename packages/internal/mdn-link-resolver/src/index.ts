import { resolveCanvasName } from './canvas';
import { resolveCssName } from './css';
import { resolveGlobalName } from './global';
import { resolveTsType } from './typescript';
import { resolveWebAudioName } from './webaudio';

export function resolveMdnLink(name: string) {
  for (const resolver of [
    resolveCanvasName,
    resolveCssName,
    resolveGlobalName,
    resolveTsType,
    resolveWebAudioName,
  ]) {
    const url = resolver(name);
    if (url) return url;
  }

  return null;
}
