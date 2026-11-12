package com.iman.leveling.widgets;

import android.content.Context;
import android.widget.RemoteViews;

import com.iman.leveling.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/** Jours jeûnés et restants, et heure de la rupture. */
public class RamadanWidget extends BaseWidget {
    private static final long DAY = 24L * 60 * 60 * 1000;

    @Override
    RemoteViews build(Context c, JSONObject snap) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_ramadan);
        v.setOnClickPendingIntent(R.id.root, WidgetCore.openApp(c));

        JSONObject r = snap == null ? null : snap.optJSONObject("ramadan");
        if (r == null) {
            v.setTextViewText(R.id.ramadan_main, "Ouvre l'application");
            v.setTextViewText(R.id.ramadan_detail, "");
            v.setTextViewText(R.id.ramadan_iftar, "");
            return v;
        }

        long start = r.optLong("startMs");
        int total = r.optInt("total", 30);
        int fasted = r.optInt("fasted");
        long now = System.currentTimeMillis();

        Calendar midnight = Calendar.getInstance();
        midnight.set(Calendar.HOUR_OF_DAY, 0);
        midnight.set(Calendar.MINUTE, 0);
        midnight.set(Calendar.SECOND, 0);
        midnight.set(Calendar.MILLISECOND, 0);
        // Arrondi : un changement d'heure décale d'une heure au plus.
        long dayNumber = Math.round((midnight.getTimeInMillis() - start) / (double) DAY) + 1;

        if (dayNumber < 1) {
            v.setTextViewText(R.id.ramadan_main, "Ramadan dans " + (1 - dayNumber) + " j");
            v.setTextViewText(R.id.ramadan_detail, "Début prévu le " + new java.text.SimpleDateFormat("d MMMM", java.util.Locale.FRANCE).format(new java.util.Date(start)));
            v.setTextViewText(R.id.ramadan_iftar, "");
        } else if (dayNumber > total) {
            v.setTextViewText(R.id.ramadan_main, "Ramadan terminé");
            v.setTextViewText(R.id.ramadan_detail, fasted + " jour(s) jeûné(s) sur " + total);
            v.setTextViewText(R.id.ramadan_iftar, "Taqabbala Llah");
        } else {
            v.setTextViewText(R.id.ramadan_main, "Jour " + dayNumber + " / " + total);
            v.setTextViewText(R.id.ramadan_detail, fasted + " jeûné(s) · " + (total - dayNumber) + " à venir");
            v.setTextViewText(R.id.ramadan_iftar, iftarText(r.optJSONArray("maghrib"), now));
        }
        return v;
    }

    private static String iftarText(JSONArray maghrib, long now) {
        for (int i = 0; maghrib != null && i < maghrib.length(); i++) {
            long t = maghrib.optLong(i);
            if (t > now) return "Rupture " + (i == 0 ? "aujourd'hui" : "demain") + " à " + WidgetCore.hhmm(t);
        }
        return "Rupture : ouvre l'application";
    }
}
