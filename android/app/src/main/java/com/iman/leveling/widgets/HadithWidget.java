package com.iman.leveling.widgets;

import android.content.Context;
import android.widget.RemoteViews;

import com.iman.leveling.R;

import org.json.JSONObject;

/** Hadith du jour (texte déjà chargé par l'application) ; toucher le widget ouvre les Rappels. */
public class HadithWidget extends BaseWidget {

    @Override
    RemoteViews build(Context c, JSONObject snap) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_hadith);
        v.setOnClickPendingIntent(R.id.root, WidgetCore.openApp(c));

        JSONObject hadith = snap == null ? null : snap.optJSONObject("hadith");
        if (hadith == null || hadith.optString("text").isEmpty()) {
            v.setTextViewText(R.id.hadith_text, "Ouvre l'application (avec une connexion) pour charger le hadith du jour.");
            v.setTextViewText(R.id.hadith_source, "");
            return v;
        }
        v.setTextViewText(R.id.hadith_text, hadith.optString("text"));
        v.setTextViewText(R.id.hadith_source, hadith.optString("source"));
        return v;
    }
}
