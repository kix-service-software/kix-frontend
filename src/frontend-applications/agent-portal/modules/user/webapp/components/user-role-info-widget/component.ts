/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { RoleLabelProvider } from '../../core/RoleLabelProvider';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Role } from '../../../model/Role';
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
        this.state.labelProvider = new RoleLabelProvider();

        const context = ContextService.getInstance().getActiveContext();

        context.registerListener('user-role-info-widget', {
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, role: Role, type: KIXObjectType | string) => {
                if (type === KIXObjectType.ROLE) {
                    this.initWidget(role);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.initWidget(await context.getObject<Role>());
    }

    private async initWidget(role: Role): Promise<void> {
        this.state.role = role;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.role) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.role]
            );
        }
    }

}

module.exports = Component;
