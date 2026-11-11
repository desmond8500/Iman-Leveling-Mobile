<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <!-- Genre -->
        <section class="card">
          <h2>Profil</h2>
          <span class="label">Genre</span>
          <ion-segment :value="settings.gender ?? ''" @ionChange="onGender">
            <ion-segment-button value="male">
              <ion-label>Homme</ion-label>
            </ion-segment-button>
            <ion-segment-button value="female">
              <ion-label>Femme</ion-label>
            </ion-segment-button>
          </ion-segment>
          <p v-if="!settings.gender" class="hint">Non renseigné.</p>
        </section>

        <!-- Apparence -->
        <section class="card">
          <h2>Apparence</h2>
          <ion-segment :value="settings.theme" @ionChange="onTheme">
            <ion-segment-button value="auto"><ion-label>Auto</ion-label></ion-segment-button>
            <ion-segment-button value="emerald"><ion-label>Émeraude</ion-label></ion-segment-button>
            <ion-segment-button value="blue"><ion-label>Bleu</ion-label></ion-segment-button>
          </ion-segment>
          <p class="hint">En mode auto, l'application passe au bleu le vendredi.</p>
        </section>

        <!-- Notifications -->
        <section class="card">
          <h2>Rappels</h2>
          <template v-if="canNotify">
            <ion-toggle
              :checked="settings.notifications.enabled"
              :disabled="!settings.location"
              @ionChange="onNotifToggle"
            >
              Notifications de prière
            </ion-toggle>
            <template v-if="settings.notifications.enabled">
              <span class="label">Rappel des ablutions</span>
              <ion-select
                interface="popover"
                :value="settings.notifications.ablutionMinutes"
                @ionChange="onAblution"
              >
                <ion-select-option v-for="m in ABLUTION_CHOICES" :key="m" :value="m">
                  {{ m === 0 ? 'Désactivé' : `${m} min avant la prière` }}
                </ion-select-option>
              </ion-select>
              <span class="label">Rappel avant la fin du temps de la prière</span>
              <ion-select interface="popover" :value="settings.notifications.endMinutes" @ionChange="onEnd">
                <ion-select-option v-for="m in END_CHOICES" :key="m" :value="m">
                  {{ m === 0 ? 'Désactivé' : `${m} min avant la fin` }}
                </ion-select-option>
              </ion-select>
            </template>
            <p v-if="!settings.location" class="hint">
              Détecte d'abord ta position : les rappels en dépendent.
            </p>
          </template>
          <p v-else class="hint">
            Les rappels sont disponibles dans l'application mobile (Android). Ils ne fonctionnent
            pas dans le navigateur.
          </p>
          <p class="hint">
            L'appel du muezzin (son de l'adhan) n'est pas encore inclus : il demande un fichier
            audio que tu dois fournir (voir le README).
          </p>
        </section>

        <!-- Pays -->
        <section class="card">
          <h2>Pays</h2>
          <p class="value">
            <ion-icon :icon="locationOutline" />
            {{ settings.countryCode ? countryName(settings.countryCode) : 'Non renseigné' }}
          </p>
          <div class="row">
            <ion-button size="small" :disabled="locating" @click="onDetect">
              <ion-spinner v-if="locating" name="dots" slot="start" />
              {{ locating ? 'Localisation…' : 'Détecter ma position' }}
            </ion-button>
            <ion-button size="small" fill="outline" @click="pickerOpen = true">Choisir</ion-button>
          </div>
          <p class="hint">
            La détection utilise ta position approximative, arrondie à environ 11 km, envoyée au
            service de géocodage BigDataCloud pour trouver le pays. L'appareil conserve aussi cette
            position (arrondie à environ 1 km) pour calculer les heures de prière ; elle n'est
            jamais envoyée à nos serveurs ni à ton compte en ligne.
          </p>
          <p v-if="settings.location" class="hint">
            Position enregistrée : {{ settings.location.lat }}, {{ settings.location.lon }}
          </p>
        </section>

        <!-- Heures de prière -->
        <section class="card">
          <h2>Heures de prière</h2>
          <span class="label">Méthode de calcul</span>
          <ion-select
            interface="popover"
            :value="settings.data.prayerMethod ?? 'auto'"
            @ionChange="onMethod"
          >
            <ion-select-option value="auto">
              Selon mon pays ({{ METHODS[settings.prayerMethod].name }})
            </ion-select-option>
            <ion-select-option v-for="id in METHOD_IDS" :key="id" :value="id">
              {{ METHODS[id].name }}
            </ion-select-option>
          </ion-select>
          <p class="hint">
            Les heures sont calculées sur l'appareil à partir de ta position. Elles peuvent différer
            de quelques minutes de celles de ta mosquée : en cas de doute, suis son calendrier.
          </p>
        </section>

        <!-- Compte et sauvegarde -->
        <section class="card">
          <h2>Sauvegarde en ligne</h2>

          <template v-if="settings.isLinked">
            <p class="value">
              <ion-icon :icon="cloudDoneOutline" />
              {{ settings.user?.name || settings.user?.email }}
            </p>
            <p class="hint">
              {{ settings.user?.email }}<br />
              Dernière synchronisation : {{ lastSyncLabel }}
            </p>
            <p v-if="settings.syncError" class="error" role="alert">{{ settings.syncError }}</p>
            <div class="row">
              <ion-button size="small" :disabled="settings.syncing" @click="onSync">
                <ion-spinner v-if="settings.syncing" name="dots" slot="start" />
                Synchroniser maintenant
              </ion-button>
              <ion-button size="small" fill="outline" color="medium" @click="onLogout">
                Se déconnecter
              </ion-button>
            </div>
            <p class="hint">
              Se déconnecter n'efface pas ta progression sur cet appareil.
            </p>
          </template>

          <template v-else>
            <p class="hint">
              Sans compte, ta progression reste uniquement sur cet appareil. Lie un compte pour la
              sauvegarder en ligne et la retrouver ailleurs.
            </p>

            <label class="field">
              <span class="label">Adresse du serveur</span>
              <input
                v-model="form.serverUrl"
                type="url"
                inputmode="url"
                autocapitalize="off"
                autocomplete="url"
                placeholder="https://mon-serveur.exemple"
                @blur="saveServer"
              />
            </label>
            <p v-if="urlError" class="error" role="alert">{{ urlError }}</p>
            <button
              v-if="form.serverUrl !== DEFAULT_SERVER_URL"
              type="button"
              class="link-button"
              @click="useOfficialServer"
            >
              Utiliser le serveur officiel
            </button>

            <ion-segment :value="mode" @ionChange="onMode">
              <ion-segment-button value="login">
                <ion-label>Connexion</ion-label>
              </ion-segment-button>
              <ion-segment-button value="register">
                <ion-label>Créer un compte</ion-label>
              </ion-segment-button>
            </ion-segment>

            <form class="form" @submit.prevent="onSubmit">
              <label v-if="mode === 'register'" class="field">
                <span class="label">Nom</span>
                <input v-model="form.name" type="text" autocomplete="name" required />
              </label>
              <label class="field">
                <span class="label">E-mail</span>
                <input v-model="form.email" type="email" autocomplete="email" required />
              </label>
              <label class="field">
                <span class="label">Mot de passe</span>
                <input
                  v-model="form.password"
                  type="password"
                  minlength="8"
                  :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
                  required
                />
              </label>

              <p v-if="authError" class="error" role="alert">{{ authError }}</p>

              <ion-button type="submit" expand="block" :disabled="busy">
                <ion-spinner v-if="busy" name="dots" slot="start" />
                {{ mode === 'register' ? 'Créer le compte et sauvegarder' : 'Se connecter et synchroniser' }}
              </ion-button>
            </form>
          </template>
        </section>

        <p class="app-version">Iman Leveling {{ versionLabel() }}</p>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :duration="2200"
        position="top"
        @didDismiss="toast.open = false"
      />
    </ion-content>

    <CountryPicker
      :open="pickerOpen"
      :selected="settings.countryCode"
      @select="onPickCountry"
      @close="pickerOpen = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToggle,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue';
import { cloudDoneOutline, locationOutline } from 'ionicons/icons';
import CountryPicker from '@/components/CountryPicker.vue';
import { countryName } from '@/data/countries';
import { LocationError } from '@/services/geolocation';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_SERVER_URL } from '@/services/api';
import { requestNotificationPermission, notificationsSupported } from '@/services/notifications';
import { ABLUTION_CHOICES, END_CHOICES } from '@/utils/notifications';
import { isThemeSetting } from '@/utils/theme';
import { versionLabel } from '@/utils/version';
import { METHODS, METHOD_IDS, isMethodId } from '@/utils/prayerTimes';

const settings = useSettingsStore();

const toast = reactive({ open: false, message: '' });
const say = (message: string) => {
  toast.message = message;
  toast.open = true;
};

// --- Genre ---
function onGender(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'male' || value === 'female') void settings.setGender(value);
}

// --- Rappels ---
const canNotify = notificationsSupported();

async function onNotifToggle(event: CustomEvent) {
  const enabled = !!event.detail.checked;
  if (enabled === settings.notifications.enabled) return;
  if (enabled && !(await requestNotificationPermission())) {
    say("Autorise les notifications dans les réglages du téléphone pour activer les rappels.");
    await settings.setNotifications({ ...settings.notifications, enabled: false });
    return;
  }
  await settings.setNotifications({ ...settings.notifications, enabled });
}

function onAblution(event: CustomEvent) {
  const minutes = Number(event.detail.value);
  void settings.setNotifications({ ...settings.notifications, ablutionMinutes: minutes });
}

function onEnd(event: CustomEvent) {
  const minutes = Number(event.detail.value);
  void settings.setNotifications({ ...settings.notifications, endMinutes: minutes });
}

// --- Apparence ---
function onTheme(event: CustomEvent) {
  const value = event.detail.value;
  if (isThemeSetting(value)) void settings.setTheme(value);
}

// --- Méthode de calcul ---
function onMethod(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'auto') void settings.setPrayerMethod(null);
  else if (isMethodId(value)) void settings.setPrayerMethod(value);
}

// --- Pays ---
const pickerOpen = ref(false);
const locating = ref(false);

async function onDetect() {
  locating.value = true;
  try {
    const code = await settings.detectAndSetCountry();
    say(`Pays détecté : ${countryName(code)}`);
  } catch (e) {
    say(e instanceof LocationError ? `${e.message} Choisis ton pays à la main.` : 'Détection impossible.');
  } finally {
    locating.value = false;
  }
}

async function onPickCountry(code: string) {
  pickerOpen.value = false;
  await settings.setCountry(code);
}

// --- Compte ---
const mode = ref<'login' | 'register'>('login');
const busy = ref(false);
const urlError = ref('');
const authError = ref('');
const form = reactive({
  serverUrl: settings.serverUrl,
  name: '',
  email: '',
  password: '',
});

function onMode(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'login' || value === 'register') {
    mode.value = value;
    authError.value = '';
  }
}

async function saveServer(): Promise<boolean> {
  if (!form.serverUrl.trim()) {
    urlError.value = "Renseigne l'adresse du serveur.";
    return false;
  }
  const ok = await settings.setServerUrl(form.serverUrl);
  urlError.value = ok
    ? ''
    : "Adresse refusée : utilise une adresse https:// (http:// n'est accepté que pour localhost).";
  if (ok) form.serverUrl = settings.serverUrl;
  return ok;
}

async function useOfficialServer() {
  form.serverUrl = DEFAULT_SERVER_URL;
  await saveServer();
}

async function onSubmit() {
  authError.value = '';
  if (!(await saveServer())) return;
  busy.value = true;
  try {
    await settings.authenticate(mode.value, {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    form.password = '';
    say(settings.syncError ? 'Compte lié, mais la synchronisation a échoué.' : 'Compte lié et progression sauvegardée.');
  } catch (e) {
    authError.value = e instanceof Error ? e.message : 'Connexion impossible.';
  } finally {
    busy.value = false;
  }
}

async function onSync() {
  const ok = await settings.syncNow();
  if (ok) say('Progression synchronisée.');
}

async function onLogout() {
  await settings.logout();
  say('Compte déconnecté.');
}

const lastSyncLabel = computed(() => {
  const iso = settings.lastSync;
  if (!iso) return 'jamais';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'jamais'
    : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
});
</script>

<style scoped>
.app-version {
  margin: 24px 0 8px;
  text-align: center;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.link-button {
  align-self: flex-start;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--iman-emerald);
  font: inherit;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}
.wrap {
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--iman-gold);
}
.value {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}
.hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--iman-text-soft);
}
.error {
  margin: 8px 0;
  font-size: 13px;
  color: #ff7a7a;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}
.field {
  display: block;
  margin-top: 12px;
}
.form .field {
  margin-top: 0;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  font: inherit;
}
input:focus {
  outline: 2px solid var(--iman-gold);
  outline-offset: 1px;
}
</style>
