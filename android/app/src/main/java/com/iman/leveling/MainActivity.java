package com.iman.leveling;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.iman.leveling.widgets.WidgetBridgePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Les plugins locaux s'enregistrent avant super.onCreate().
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
