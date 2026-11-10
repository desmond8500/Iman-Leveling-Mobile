import { LocationError, reverseGeocodeCountry } from '../../src/services/geolocation';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const withFetch = (fn: (url: string) => Response | Promise<Response>) =>
  ((url: string) => Promise.resolve(fn(url))) as unknown as typeof fetch;

describe('reverseGeocodeCountry', () => {
  it('renvoie le code pays du service', async () => {
    expect(await reverseGeocodeCountry(48.85, 2.35, withFetch(() => json({ countryCode: 'FR' })))).toBe('FR');
  });

  it('met le code en majuscules', async () => {
    expect(await reverseGeocodeCountry(0, 0, withFetch(() => json({ countryCode: 'sn' })))).toBe('SN');
  });

  it('n\'envoie qu\'une position arrondie à 0,1 degré', async () => {
    let requested = '';
    await reverseGeocodeCountry(
      48.856614,
      2.352222,
      withFetch((url) => {
        requested = url;
        return json({ countryCode: 'FR' });
      }),
    );
    expect(requested).toContain('latitude=48.9');
    expect(requested).toContain('longitude=2.4');
    expect(requested).not.toContain('48.856');
  });

  it.each([{}, { countryCode: '' }, { countryCode: 'XX' }, { countryCode: 12 }, null])(
    'échoue si le service ne donne pas de pays valide (%j)',
    async (body) => {
      await expect(reverseGeocodeCountry(1, 1, withFetch(() => json(body)))).rejects.toMatchObject({
        name: 'LocationError',
        reason: 'unavailable',
      });
    },
  );

  it('échoue avec « network » si le service répond une erreur ou est injoignable', async () => {
    await expect(reverseGeocodeCountry(1, 1, withFetch(() => json({}, 500)))).rejects.toMatchObject({
      reason: 'network',
    });
    const down = (() => Promise.reject(new TypeError('offline'))) as unknown as typeof fetch;
    const err = await reverseGeocodeCountry(1, 1, down).catch((e) => e);
    expect(err).toBeInstanceOf(LocationError);
    expect(err.reason).toBe('network');
  });
});
