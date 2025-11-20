/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TabWidgetConfiguration } from '../../../../../model/configuration/TabWidgetConfiguration';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.configuration as TabWidgetConfiguration;
            const widgets = [];
            for (const w of settings.widgets) {
                const config = await this.context?.getConfiguredWidget(w);
                if (config) {
                    widgets.push(config);
                }
            }
            this.state.widgets = widgets;
        }
        this.state.show = true;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

}

module.exports = Component;
