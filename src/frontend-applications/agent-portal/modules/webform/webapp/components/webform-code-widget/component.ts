/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { WebformDetailsContext } from '../../core';
import { Webform } from '../../../model/Webform';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        context.registerListener('webform-code-widget', {
            sidebarRightToggled: () => { return; },
            sidebarLeftToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (webformId: string, webform: Webform, type: KIXObjectType) => {
                if (type === KIXObjectType.WEBFORM) {
                    this.initWidget(webform);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<Webform>());
    }

    private async initWidget(webform: Webform): Promise<void> {
        this.state.webform = webform;
        this.state.title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : 'Translatable#Code';
    }

    public async onDestroy(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener('webform-code-widget');
    }

}

module.exports = Component;
