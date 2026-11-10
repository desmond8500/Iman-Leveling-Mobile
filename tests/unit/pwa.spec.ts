import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { manifest } from '../../pwa.manifest';

const root = join(__dirname, '..', '..');

/** Largeur et hauteur lues dans l'en-tête d'un PNG (octets 16 à 24). */
function pngSize(path: string) {
  const buf = readFileSync(path);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('manifeste PWA', () => {
  it('a les champs requis pour être installable', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('déclare des icônes 192 et 512 et une icône maskable', () => {
    const icons = manifest.icons ?? [];
    const sizes = icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  it('pointe vers des fichiers qui existent, aux dimensions annoncées', () => {
    for (const icon of manifest.icons ?? []) {
      const file = join(root, 'public', icon.src.replace(/^\//, ''));
      expect(existsSync(file)).toBe(true);
      const [w, h] = (icon.sizes ?? '').split('x').map(Number);
      expect(pngSize(file)).toEqual({ width: w, height: h });
    }
  });
});

describe('index.html', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf-8');

  it('référence des fichiers qui existent', () => {
    for (const match of html.matchAll(/href="\/([^"]+\.png)"/g)) {
      expect(existsSync(join(root, 'public', match[1]))).toBe(true);
    }
  });

  it('a les balises pour l\'installation sur iOS et Android', () => {
    expect(html).toContain('apple-touch-icon');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('name="theme-color"');
  });
});
