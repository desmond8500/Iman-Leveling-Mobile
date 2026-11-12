package com.iman.leveling.widgets;

import android.content.Context;
import android.widget.RemoteViews;

import com.iman.leveling.R;

import org.json.JSONArray;
import org.json.JSONObject;

/** Un nom d'Allah tiré au hasard ; toucher le bouton en affiche un autre. */
public class NameWidget extends BaseWidget {

    @Override
    RemoteViews build(Context c, JSONObject snap) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_name);
        v.setOnClickPendingIntent(R.id.root, WidgetCore.openApp(c));
        v.setOnClickPendingIntent(R.id.btn_next, WidgetCore.broadcast(
            c, NameWidget.class, WidgetCore.ACTION_NEXT_NAME, 300, null, null, null, null));

        JSONArray names = snap == null ? null : snap.optJSONArray("names");
        if (names == null || names.length() == 0) {
            v.setTextViewText(R.id.name_arabic, "الله");
            v.setTextViewText(R.id.name_translit, "Ouvre l'application");
            v.setTextViewText(R.id.name_french, "");
            return v;
        }
        JSONArray name = names.optJSONArray(WidgetCore.nameIndex(c, names.length()));
        if (name == null) return v;
        v.setTextViewText(R.id.name_arabic, name.optString(0));
        v.setTextViewText(R.id.name_translit, name.optString(1));
        v.setTextViewText(R.id.name_french, name.optString(2));
        return v;
    }

    @Override
    public void onReceive(Context context, android.content.Intent intent) {
        if (intent != null && WidgetCore.ACTION_NEXT_NAME.equals(intent.getAction())) {
            JSONObject snap = WidgetCore.snapshot(context);
            JSONArray names = snap == null ? null : snap.optJSONArray("names");
            if (names != null) WidgetCore.pickNewName(context, names.length());
            WidgetCore.refreshAll(context);
            return;
        }
        super.onReceive(context, intent);
    }
}
