/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { QueueDetailsContext } from './webapp/core';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-queue-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const queueInfoWidget = new WidgetConfiguration(
            'queue-details-info-widget', 'Queue Details Info Widget', ConfigurationType.Widget,
            'ticket-queue-info-widget', 'Translatable#Queue Information',
            [], null, null, false, true, WidgetSize.BOTH, false
        );
        configurations.push(queueInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'queue-details-tab-widget-config', 'Queue Details Tab Widget Config', ConfigurationType.TabWidget,
            ['queue-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabLaneWidget = new WidgetConfiguration(
            'queue-details-tab-widget', 'Queue Details Tabs', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('queue-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLaneWidget);

        const signatureWidget = new WidgetConfiguration(
            'queue-details-signature-widget', 'Queue Details Signature Widget', ConfigurationType.Widget,
            'ticket-queue-signature', 'Translatable#Signature', [], null, null, true, true, WidgetSize.BOTH, false
        );
        configurations.push(signatureWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Queue Details', ConfigurationType.Context,
                QueueDetailsContext.CONTEXT_ID,
                [], [],
                [
                    new ConfiguredWidget('queue-details-tab-widget', 'queue-details-tab-widget'),
                    new ConfiguredWidget('queue-details-signature-widget', 'queue-details-signature-widget')
                ],
                [],
                [
                    'ticket-admin-queue-create'
                ],
                [
                    'ticket-admin-queue-edit', 'ticket-admin-queue-duplicate'
                ],
                [],
                [
                    new ConfiguredWidget('queue-details-info-widget', 'queue-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
