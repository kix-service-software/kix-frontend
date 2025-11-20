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
import { OrganisationAdditionalInformationKeys } from '../../core/context/OrganisationContext';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    private inputInstanceId: string;

    public onCreate(input: any): void {
        super.onCreate(input, 'contact-list-widget');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.inputInstanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.context?.registerListener('contact-list-widget', {
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectListChanged: () => { return; },
            objectChanged: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            additionalInformationChanged: (key: string, value: any) => {
                this.setWidgetDependingMode();
            }
        });

        this.state.filterActions = await ActionFactory.getInstance().generateActions(
            ['contact-table-depending-action'], null, this.contextInstanceId
        );

        this.setWidgetDependingMode();
        this.state.prepared = true;
    }

    public onDestroy(): void {
        super.onDestroy();
        this.context?.unregisterListener('contact-list-widget');
    }

    private async setWidgetDependingMode(): Promise<void> {
        const depending = this.context?.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );

        if (typeof depending !== 'undefined' && depending) {
            this.context.widgetService.setWidgetTitle(this.inputInstanceId, 'Translatable#Assigned Contacts');
            this.context.widgetService.setWidgetClasses(this.inputInstanceId, ['depending-widget']);
        } else {
            this.context.widgetService.setWidgetTitle(this.inputInstanceId, null);
            this.context.widgetService.setWidgetClasses(this.inputInstanceId, []);
        }

        this.state.filterActions = await ActionFactory.getInstance().generateActions(
            ['contact-table-depending-action'], null, this.contextInstanceId
        );
        this.context.widgetService.updateActions(this.inputInstanceId);
    }

}

module.exports = Component;
