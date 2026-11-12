package com.iman.leveling.widgets;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Pont entre l'application web et les widgets : `update` (instantané) et `takeActions` (validations). */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        String snapshot = call.getString("snapshot");
        if (snapshot == null) {
            call.reject("snapshot manquant");
            return;
        }
        WidgetCore.saveSnapshot(getContext(), snapshot);
        WidgetCore.refreshAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void takeActions(PluginCall call) {
        JSObject result = new JSObject();
        result.put("actions", WidgetCore.takeActions(getContext()));
        call.resolve(result);
    }
}
