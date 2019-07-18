/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration, TabWidgetSettings
} from '../../core/model';
import { SystemAddressDetailsContext } from '../../core/browser/system-address/context';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return SystemAddressDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('system-address-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['system-address-info-widget']))
        );

        const systemAddressInfoWidget = new ConfiguredWidget('system-address-info-widget',
            new WidgetConfiguration(
                'system-address-info-widget', 'Translatable#Email Information', ['system-address-edit'], null,
                false, true, null, false
            )
        );

        const systemAddressAssignedQueuesWidget = new ConfiguredWidget('system-address-assigned-queues-widget',
            new WidgetConfiguration(
                'system-address-assigned-queues-widget', 'Translatable#Assigned Queues', [], null,
                false, true, null, false
            )
        );

        return new ContextConfiguration(
            SystemAddressDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['system-address-details-tab-widget'],
            [tabLane, systemAddressAssignedQueuesWidget, systemAddressInfoWidget],
            [], [],
            ['system-address-create'],
            ['system-address-edit', 'print-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
