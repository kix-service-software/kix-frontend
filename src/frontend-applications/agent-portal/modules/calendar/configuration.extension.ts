/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { CalendarContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { CalendarConfiguration } from './webapp/core/CalendarConfiguration';
import { TicketProperty } from '../ticket/model/TicketProperty';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return CalendarContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        configurations.push(
            new WidgetConfiguration(
                'calendar-main-widget', 'calendar Widget', ConfigurationType.Widget,
                'calendar-widget', 'My calendar Widget', [], null,
                new CalendarConfiguration('PlanBegin', 'PlanEnd', [
                    TicketProperty.CONTACT_ID,
                    TicketProperty.STATE_ID,
                    TicketProperty.QUEUE_ID,
                    TicketProperty.RESPONSIBLE_ID,
                    TicketProperty.CHANGED,
                    'DynamicFields.PlanBegin',
                    'DynamicFields.PlanEnd',
                ]), false, false, 'kix-icon-calendar'
            )
        );

        configurations.push(new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [],
            [], [],
            [
                new ConfiguredWidget('calendar-main-widget', 'calendar-main-widget')
            ], [],
        ));

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
