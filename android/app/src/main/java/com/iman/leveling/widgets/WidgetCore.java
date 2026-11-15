package com.iman.leveling.widgets;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.iman.leveling.MainActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Random;

/**
 * Stockage et logique communs aux widgets.
 *
 * L'application (TypeScript) envoie un « instantané » JSON : prières du jour avec leur horaire,
 * invocations, Ramadan, 99 noms. Les widgets choisissent quoi afficher selon l'heure. Quand on
 * valide quelque chose depuis un widget, on met l'instantané à jour tout de suite (pour que
 * l'affichage change) et on note l'action dans une file que l'application applique à son retour.
 */
final class WidgetCore {
    static final String PREFS = "iman_widgets";
    private static final String KEY_SNAPSHOT = "snapshot";
    private static final String KEY_ACTIONS = "actions";
    private static final String KEY_NAME = "name_index";

    static final String ACTION_DONE = "com.iman.leveling.widgets.DONE";
    static final String ACTION_REFRESH = "com.iman.leveling.widgets.REFRESH";
    static final String ACTION_NEXT_NAME = "com.iman.leveling.widgets.NEXT_NAME";

    private static final Class<?>[] PROVIDERS = {
        PrayerWidget.class, DhikrWidget.class, RamadanWidget.class, NameWidget.class, HadithWidget.class
    };

    private WidgetCore() {}

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    // --- Instantané ---

    static synchronized JSONObject snapshot(Context c) {
        String raw = prefs(c).getString(KEY_SNAPSHOT, null);
        if (raw == null) return null;
        try {
            return new JSONObject(raw);
        } catch (JSONException e) {
            return null;
        }
    }

    static synchronized void saveSnapshot(Context c, String json) {
        prefs(c).edit().putString(KEY_SNAPSHOT, json).apply();
    }

    // --- File d'actions ---

    static synchronized void queueAction(Context c, JSONObject action) {
        JSONArray list = readActions(c);
        list.put(action);
        prefs(c).edit().putString(KEY_ACTIONS, list.toString()).apply();
    }

    /** Renvoie la file (texte JSON) et la vide. */
    static synchronized String takeActions(Context c) {
        String raw = prefs(c).getString(KEY_ACTIONS, "[]");
        prefs(c).edit().remove(KEY_ACTIONS).apply();
        return raw == null ? "[]" : raw;
    }

    private static JSONArray readActions(Context c) {
        try {
            return new JSONArray(prefs(c).getString(KEY_ACTIONS, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    // --- Validation depuis un widget ---

    /** Coche l'élément dans l'instantané et ajoute l'action à la file. */
    static synchronized void markDone(Context c, String type, String id, String period, String dateKey) {
        JSONObject snap = snapshot(c);
        if (snap == null || type == null || id == null || dateKey == null) return;
        try {
            if ("dhikr".equals(type) && period != null) {
                JSONArray items = snap.getJSONObject("adhkar").optJSONArray(period);
                for (int i = 0; items != null && i < items.length(); i++) {
                    JSONObject item = items.getJSONObject(i);
                    if (id.equals(item.optString("id"))) item.put("done", true);
                }
            } else {
                JSONArray slots = snap.optJSONArray("slots");
                for (int i = 0; slots != null && i < slots.length(); i++) {
                    JSONObject slot = slots.getJSONObject(i);
                    if (!dateKey.equals(slot.optString("dateKey"))) continue;
                    if ("prayer".equals(type) && id.equals(slot.optString("id"))) slot.put("done", true);
                    if ("sunnah".equals(type)) {
                        JSONArray sunnah = slot.optJSONArray("sunnah");
                        for (int j = 0; sunnah != null && j < sunnah.length(); j++) {
                            JSONObject s = sunnah.getJSONObject(j);
                            if (id.equals(s.optString("id"))) s.put("done", true);
                        }
                    }
                }
            }
            saveSnapshot(c, snap.toString());

            JSONObject action = new JSONObject();
            action.put("type", type);
            action.put("id", id);
            action.put("dateKey", dateKey);
            if (period != null) action.put("period", period);
            queueAction(c, action);
        } catch (JSONException ignored) {
            // Instantané illisible : on n'enregistre rien.
        }
    }

    // --- Choix de ce qui s'affiche ---

    /** Créneau de prière en cours à l'instant `now`, ou null. */
    static JSONObject currentSlot(JSONObject snap, long now) {
        JSONArray slots = snap.optJSONArray("slots");
        for (int i = 0; slots != null && i < slots.length(); i++) {
            JSONObject s = slots.optJSONObject(i);
            if (s != null && s.optLong("start") <= now && now < s.optLong("end")) return s;
        }
        return null;
    }

    static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static String hhmm(long ms) {
        return new SimpleDateFormat("HH:mm", Locale.FRANCE).format(new Date(ms));
    }

    static String dateLabel() {
        String label = new SimpleDateFormat("EEEE d MMMM", Locale.FRANCE).format(new Date());
        return label.isEmpty() ? label : Character.toUpperCase(label.charAt(0)) + label.substring(1);
    }

    /** Période d'invocations : matin avant 15 h, soir ensuite. */
    static String currentPeriod() {
        int hour = Integer.parseInt(new SimpleDateFormat("H", Locale.US).format(new Date()));
        return hour < 15 ? "morning" : "evening";
    }

    // --- Nom d'Allah du moment ---

    static int nameIndex(Context c, int total) {
        int idx = prefs(c).getInt(KEY_NAME, -1);
        if (idx < 0 || idx >= total) idx = pickNewName(c, total);
        return idx;
    }

    static int pickNewName(Context c, int total) {
        int previous = prefs(c).getInt(KEY_NAME, -1);
        int idx = total <= 1 ? 0 : new Random().nextInt(total);
        if (total > 1 && idx == previous) idx = (idx + 1) % total;
        prefs(c).edit().putInt(KEY_NAME, idx).apply();
        return idx;
    }

    // --- Intents ---

    static PendingIntent openApp(Context c) {
        Intent intent = new Intent(c, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, 1, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** Diffusion vers un widget précis (récepteur non exporté), avec un code de requête unique. */
    static PendingIntent broadcast(Context c, Class<?> target, String action, int requestCode,
                                   String type, String id, String period, String dateKey) {
        Intent intent = new Intent(c, target);
        intent.setAction(action);
        if (type != null) intent.putExtra("type", type);
        if (id != null) intent.putExtra("id", id);
        if (period != null) intent.putExtra("period", period);
        if (dateKey != null) intent.putExtra("dateKey", dateKey);
        return PendingIntent.getBroadcast(c, requestCode, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    // --- Rafraîchissement ---

    /** Redessine tous les widgets posés sur l'écran d'accueil, puis programme le prochain changement. */
    static void refreshAll(Context c) {
        AppWidgetManager manager = AppWidgetManager.getInstance(c);
        for (Class<?> provider : PROVIDERS) {
            int[] ids = manager.getAppWidgetIds(new ComponentName(c, provider));
            if (ids == null || ids.length == 0) continue;
            try {
                ((BaseWidget) provider.getDeclaredConstructor().newInstance()).update(c, manager, ids);
            } catch (ReflectiveOperationException ignored) {
                // Ne peut pas arriver : les classes sont fixes.
            }
        }
        scheduleNextChange(c);
    }

    /** Réveille les widgets au prochain début ou fin de prière (alarme inexacte : aucune permission). */
    private static void scheduleNextChange(Context c) {
        JSONObject snap = snapshot(c);
        if (snap == null) return;
        long now = System.currentTimeMillis();
        long next = Long.MAX_VALUE;
        JSONArray slots = snap.optJSONArray("slots");
        for (int i = 0; slots != null && i < slots.length(); i++) {
            JSONObject s = slots.optJSONObject(i);
            if (s == null) continue;
            long start = s.optLong("start");
            long end = s.optLong("end");
            if (start > now && start < next) next = start;
            if (end > now && end < next) next = end;
        }
        AlarmManager alarms = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null || next == Long.MAX_VALUE) return;
        alarms.set(AlarmManager.RTC, next + 1000, broadcast(c, PrayerWidget.class, ACTION_REFRESH, 7, null, null, null, null));
    }
}
