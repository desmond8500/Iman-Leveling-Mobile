import { readFileSync } from 'node:fs';
import { APP_VERSION, androidVersionCode, versionLabel } from '../../src/utils/version';

describe('version', () => {
  it('hors compilation, la version vaut « dev »', () => {
    expect(APP_VERSION).toBe('dev');
    expect(versionLabel()).toBe('dev');
  });
  it('préfixe un numéro de version par « v »', () => {
    expect(versionLabel('0.2.0')).toBe('v0.2.0');
  });
  it('calcule un versionCode croissant', () => {
    expect(androidVersionCode('0.2.0')).toBe(200);
    expect(androidVersionCode('1.4.12')).toBe(10412);
    expect(androidVersionCode('0.2.1')!).toBeGreaterThan(androidVersionCode('0.2.0')!);
    expect(androidVersionCode('1.0.0')!).toBeGreaterThan(androidVersionCode('0.99.99')!);
    expect(androidVersionCode('abc')).toBeNull();
    expect(androidVersionCode('1.100.0')).toBeNull();
  });
  it('package.json et Android restent alignés', () => {
    const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string;
    const gradle = readFileSync('android/app/build.gradle', 'utf8');
    expect(gradle).toContain(`versionName "${version}"`);
    expect(gradle).toContain(`versionCode ${androidVersionCode(version)}`);
  });


});
