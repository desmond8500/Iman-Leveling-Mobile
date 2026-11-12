package com.iman.leveling.widgets;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import com.iman.leveling.R;

import org.json.JSONArray;
import org.json.JSONObject;

/** Une invocation du matin ou du soir à la fois ; valider affiche la suivante. */
public class DhikrWidget extends BaseWidget {

    @Override
    RemoteViews build(Context c, JSONObject snap) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_dhikr);
        v.setOnClickPendingIntent(R.id.root, WidgetCore.openApp(c));
        v.setViewVisibility(R.id.btn_dhikr, View.GONE);

        String period = WidgetCore.currentPeriod();
        boolean morning = "morning".equals(period);
        v.setTextViewText(R.id.header, morning ? "Invocations du matin" : "Invocations du soir");

        // Les coches de l'instantané sont celles du jour où il a été généré.
        if (snap == null || !WidgetCore.todayKey().equals(snap.optString("dateKey"))) {
            v.setTextViewText(R.id.dhikr_title, "Ouvre l'application");
            v.setTextViewText(R.id.dhikr_arabic, "");
            v.setTextViewText(R.id.progress, "pour actualiser");
            return v;
        }

        JSONObject adhkar = snap.optJSONObject("adhkar");
        JSONArray items = adhkar == null ? null : adhkar.optJSONArray(period);
        int total = items == null ? 0 : items.length();
        int done = 0;
        JSONObject current = null;
        for (int i = 0; i < total; i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;
            if (item.optBoolean("done")) done++;
            else if (current == null) current = item;
        }
        v.setTextViewText(R.id.progress, done + " / " + total);

        if (current == null) {
            v.setTextViewText(R.id.dhikr_title, "Tout est fait ✓");
            v.setTextViewText(R.id.dhikr_arabic, "");
            return v;
        }
        int count = current.optInt("count", 1);
        v.setTextViewText(R.id.dhikr_title, current.optString("title") + (count > 1 ? "  ×" + count : ""));
        v.setTextViewText(R.id.dhikr_arabic, current.optString("arabic"));
        v.setViewVisibility(R.id.btn_dhikr, View.VISIBLE);
        v.setOnClickPendingIntent(R.id.btn_dhikr, WidgetCore.broadcast(
            c, DhikrWidget.class, WidgetCore.ACTION_DONE, 200, "dhikr", current.optString("id"), period, snap.optString("dateKey")));
        return v;
    }
}
