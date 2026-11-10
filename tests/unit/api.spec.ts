import { ApiClient, ApiError, normalizeServerUrl } from '../../src/services/api';

describe('normalizeServerUrl', () => {
  it('accepte https et retire la barre finale, les paramètres et l\'ancre', () => {
    expect(normalizeServerUrl('https://iman.example.com/')).toBe('https://iman.example.com');
    expect(normalizeServerUrl('  https://iman.example.com/app/?x=1#y ')).toBe(
      'https://iman.example.com/app',
    );
  });

  it('accepte http uniquement pour localhost', () => {
    expect(normalizeServerUrl('http://localhost:8000')).toBe('http://localhost:8000');
    expect(normalizeServerUrl('http://127.0.0.1:8000/')).toBe('http://127.0.0.1:8000');
    expect(normalizeServerUrl('http://iman.example.com')).toBeNull();
  });

  it.each(['', 'iman.example.com', 'ftp://iman.example.com', 'javascript:alert(1)', 'https://'])(
    'refuse %j',
    (input) => {
      expect(normalizeServerUrl(input)).toBeNull();
    },
  );
});

type Call = { url: string; init: RequestInit };

function fakeFetch(responder: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    const call = { url, init };
    calls.push(call);
    return responder(call);
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('ApiClient', () => {
  it('envoie la connexion au bon endroit, sans jeton', async () => {
    const { fn, calls } = fakeFetch(() => json({ token: 't', user: { name: 'A', email: 'a@b.c' } }));
    const res = await new ApiClient('https://s.test', null, fn).login('a@b.c', 'motdepasse');
    expect(res.token).toBe('t');
    expect(calls[0].url).toBe('https://s.test/api/auth/login');
    expect(calls[0].init.method).toBe('POST');
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ email: 'a@b.c', password: 'motdepasse' });
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('ajoute le jeton porteur quand il est connu', async () => {
    const { fn, calls } = fakeFetch(() => json({ data: { version: 1, days: {} }, updated_at: null }));
    await new ApiClient('https://s.test', 'abc', fn).getProgress();
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
  });

  it('renvoie null quand il n\'y a pas encore de progression (404)', async () => {
    const { fn } = fakeFetch(() => json({ message: 'Not found' }, 404));
    expect(await new ApiClient('https://s.test', 't', fn).getProgress()).toBeNull();
  });

  it('nettoie la progression reçue du serveur', async () => {
    const { fn } = fakeFetch(() =>
      json({ data: { days: { '2026-11-09': { prayers: { fajr: true, x: 'oui' } }, nimporte: {} } }, updated_at: 'D' }),
    );
    const res = await new ApiClient('https://s.test', 't', fn).getProgress();
    expect(res?.data.days).toEqual({ '2026-11-09': { prayers: { fajr: true } } });
    expect(res?.updated_at).toBe('D');
  });

  it('envoie la progression en PUT', async () => {
    const { fn, calls } = fakeFetch(() => json({ updated_at: 'D' }));
    const data = { version: 1 as const, days: { '2026-11-09': { prayers: { fajr: true } } } };
    await new ApiClient('https://s.test', 't', fn).putProgress(data);
    expect(calls[0].init.method).toBe('PUT');
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ data });
  });

  it('utilise le message du serveur et garde le code HTTP', async () => {
    const { fn } = fakeFetch(() => json({ message: 'Identifiants invalides.' }, 422));
    await expect(new ApiClient('https://s.test', null, fn).login('a', 'b')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Identifiants invalides.',
      status: 422,
    });
  });

  it('donne un message générique si la réponse n\'est pas du JSON', async () => {
    const { fn } = fakeFetch(() => new Response('<html>502</html>', { status: 502 }));
    await expect(new ApiClient('https://s.test', 't', fn).getProgress()).rejects.toMatchObject({
      message: 'Erreur du serveur (502).',
      status: 502,
    });
  });

  it('signale un serveur injoignable avec le statut 0', async () => {
    const fn = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    const err = await new ApiClient('https://s.test', 't', fn).getProgress().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toBe('Serveur injoignable.');
  });
});
