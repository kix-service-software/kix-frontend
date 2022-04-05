/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextType } from '../../../../../model/ContextType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TabWidgetConfiguration } from '../../../../../model/configuration/TabWidgetConfiguration';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextType: ContextType;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
        this.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            const settings = this.state.widgetConfiguration.configuration as TabWidgetConfiguration;
            const widgets = [];
            for (const w of settings.widgets) {
                const config = await context.getConfiguredWidget(w);
                if (config) {
                    widgets.push(config);
                }
            }
            this.state.widgets = widgets;
        }
        this.state.show = true;
    }

}

module.exports = Component;
