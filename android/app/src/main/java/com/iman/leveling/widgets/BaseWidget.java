package com.iman.leveling.widgets;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONObject;

/** Socle des widgets : gère la mise à jour périodique et les touches sur les boutons. */
abstract class BaseWidget extends AppWidgetProvider {

    /** Construit l'affichage. `snap` vaut null tant que l'application n'a rien envoyé. */
    abstract RemoteViews build(Context context, JSONObject snap);

    final void update(Context context, AppWidgetManager manager, int[] ids) {
        RemoteViews views = build(context, WidgetCore.snapshot(context));
        manager.updateAppWidget(ids, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        update(context, manager, ids);
        WidgetCore.refreshAll(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (WidgetCore.ACTION_DONE.equals(action)) {
            WidgetCore.markDone(
                context,
                intent.getStringExtra("type"),
                intent.getStringExtra("id"),
                intent.getStringExtra("period"),
                intent.getStringExtra("dateKey"));
            WidgetCore.refreshAll(context);
        } else if (WidgetCore.ACTION_REFRESH.equals(action)) {
            WidgetCore.refreshAll(context);
        } else {
            super.onReceive(context, intent);
        }
    }
}
