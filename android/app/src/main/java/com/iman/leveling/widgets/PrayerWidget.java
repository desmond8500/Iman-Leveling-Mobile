package com.iman.leveling.widgets;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import com.iman.leveling.R;

import org.json.JSONArray;
import org.json.JSONObject;

/** Date, prière en cours (valable maintenant) et sunnas associées, validables d'une touche. */
public class PrayerWidget extends BaseWidget {
    private static final int[] SUNNAH_VIEWS = {R.id.sunnah1, R.id.sunnah2};

    @Override
    RemoteViews build(Context c, JSONObject snap) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_prayer);
        v.setOnClickPendingIntent(R.id.root, WidgetCore.openApp(c));

        String hijri = snap != null && WidgetCore.todayKey().equals(snap.optString("dateKey"))
            ? snap.optString("hijriLabel") : "";
        v.setTextViewText(R.id.date, hijri.isEmpty() ? WidgetCore.dateLabel() : WidgetCore.dateLabel() + " · " + hijri);

        v.setViewVisibility(R.id.btn_prayer, View.GONE);
        for (int id : SUNNAH_VIEWS) v.setViewVisibility(id, View.GONE);

        if (snap == null) {
            v.setTextViewText(R.id.prayer_name, "Ouvre l'application");
            v.setTextViewText(R.id.prayer_time, "pour afficher tes prières");
            return v;
        }
        if (!snap.optBoolean("hasLocation")) {
            v.setTextViewText(R.id.prayer_name, "Position requise");
            v.setTextViewText(R.id.prayer_time, "Active-la dans Paramètres");
            return v;
        }

        long now = System.currentTimeMillis();
        JSONObject slot = WidgetCore.currentSlot(snap, now);
        if (slot == null) {
            v.setTextViewText(R.id.prayer_name, "Aucune prière en cours");
            v.setTextViewText(R.id.prayer_time, nextText(snap, now));
            return v;
        }

        String dateKey = slot.optString("dateKey");
        String id = slot.optString("id");
        boolean done = slot.optBoolean("done");
        v.setTextViewText(R.id.prayer_name, slot.optString("name") + "  " + slot.optString("arabic"));
        v.setTextViewText(R.id.prayer_time, "Jusqu'à " + WidgetCore.hhmm(slot.optLong("end")));

        v.setViewVisibility(R.id.btn_prayer, View.VISIBLE);
        if (done) {
            v.setTextViewText(R.id.btn_prayer, "✓ Prière faite");
            v.setOnClickPendingIntent(R.id.btn_prayer, WidgetCore.openApp(c));
        } else {
            v.setTextViewText(R.id.btn_prayer, "Valider la prière");
            v.setOnClickPendingIntent(R.id.btn_prayer, WidgetCore.broadcast(
                c, PrayerWidget.class, WidgetCore.ACTION_DONE, 100, "prayer", id, null, dateKey));
        }

        JSONArray sunnah = slot.optJSONArray("sunnah");
        for (int i = 0; sunnah != null && i < sunnah.length() && i < SUNNAH_VIEWS.length; i++) {
            JSONObject s = sunnah.optJSONObject(i);
            if (s == null) continue;
            boolean sDone = s.optBoolean("done");
            v.setViewVisibility(SUNNAH_VIEWS[i], View.VISIBLE);
            v.setTextViewText(SUNNAH_VIEWS[i], (sDone ? "✓ " : "○ ") + s.optString("name") + " (" + s.optInt("rakaat") + ")");
            v.setOnClickPendingIntent(SUNNAH_VIEWS[i], sDone
                ? WidgetCore.openApp(c)
                : WidgetCore.broadcast(c, PrayerWidget.class, WidgetCore.ACTION_DONE, 101 + i,
                    "sunnah", s.optString("id"), null, dateKey));
        }
        return v;
    }

    private static String nextText(JSONObject snap, long now) {
        JSONArray slots = snap.optJSONArray("slots");
        JSONObject next = null;
        for (int i = 0; slots != null && i < slots.length(); i++) {
            JSONObject s = slots.optJSONObject(i);
            if (s != null && s.optLong("start") > now && (next == null || s.optLong("start") < next.optLong("start"))) next = s;
        }
        return next == null ? "Ouvre l'application"
            : "Prochaine : " + next.optString("name") + " à " + WidgetCore.hhmm(next.optLong("start"));
    }
}
