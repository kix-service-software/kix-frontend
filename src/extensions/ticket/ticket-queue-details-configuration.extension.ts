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
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TabWidgetConfiguration
} from '../../core/model';
import { QueueDetailsContext } from '../../core/browser/ticket';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-queue-details';
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const queueInfoWidget = new WidgetConfiguration(
            'queue-details-info-widget', 'Queue Details Info Widget', ConfigurationType.Widget,
            'ticket-queue-info-widget', 'Translatable#Queue Information',
            [], null, null, false, true, WidgetSize.BOTH, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(queueInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'queue-details-tab-widget-config', 'Queue Details Tab Widget Config', ConfigurationType.TabWidget,
            ['queue-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLaneWidget = new WidgetConfiguration(
            'queue-details-tab-widget', 'Queue Details Tabs', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('queue-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLaneWidget);

        const signatureWidget = new WidgetConfiguration(
            'queue-details-signature-widget', 'Queue Details Signature Widget', ConfigurationType.Widget,
            'ticket-queue-signature', 'Translatable#Signature', [], null, null, true, true, WidgetSize.BOTH, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(signatureWidget);

        return new ContextConfiguration(
            'queue-details', 'Queue Details', ConfigurationType.Context,
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
                'ticket-admin-queue-edit', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('queue-details-info-widget', 'queue-details-info-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
