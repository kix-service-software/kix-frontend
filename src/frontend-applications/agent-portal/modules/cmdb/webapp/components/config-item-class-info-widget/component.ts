/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ConfigItemClassLabelProvider } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new ConfigItemClassLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener('config-item-class-info-widget', {
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ciClassId: string, ciClass: ConfigItemClass, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM_CLASS) {
                    this.initWidget(ciClass);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<ConfigItemClass>());
    }

    private async initWidget(ciClass: ConfigItemClass): Promise<void> {
        this.state.ciClass = ciClass;
        await this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.ciClass) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.ciClass]
            );
        }
    }

}

module.exports = Component;
