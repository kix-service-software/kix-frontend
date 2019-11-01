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
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration,
    KIXObjectType, MailFilterProperty, KIXObjectProperty, TableWidgetConfiguration, SortOrder,
    ObjectInformationWidgetConfiguration, TabWidgetConfiguration
} from '../../core/model';
import { MailFilterDetailsContext } from '../../core/browser/mail-filter/context';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailFilterDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const objectInfoConfig = new ObjectInformationWidgetConfiguration(
            'mail-filter-object-info-config', 'Object info', ConfigurationType.ObjectInformation,
            KIXObjectType.MAIL_FILTER,
            [
                MailFilterProperty.NAME,
                MailFilterProperty.STOP_AFTER_MATCH,
                KIXObjectProperty.COMMENT,
                KIXObjectProperty.VALID_ID,
                KIXObjectProperty.CREATE_BY,
                KIXObjectProperty.CREATE_TIME,
                KIXObjectProperty.CHANGE_BY,
                KIXObjectProperty.CHANGE_TIME
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(objectInfoConfig);

        const mailFilterInfoLane = new WidgetConfiguration(
            'mail-filter-details-object-info-widget', 'Info WIdget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Email Filter Information', [],
            new ConfigurationDefinition('mail-filter-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(mailFilterInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'mail-filter-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['mail-filter-details-object-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'mail-filter-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('mail-filter-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);

        const conditionsTableWidgetConfig = new TableWidgetConfiguration(
            'mail-filter-details-conditions-table-widget-config', 'Table Widget Config',
            ConfigurationType.TableWidget,
            KIXObjectType.MAIL_FILTER_MATCH, ['Key', SortOrder.UP], null, null, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(conditionsTableWidgetConfig);

        const mailFilterConditionWidget = new WidgetConfiguration(
            'mail-filter-details-conditions-table-widget', 'Table WIdget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Filter Conditions', [],
            new ConfigurationDefinition(
                'mail-filter-details-conditions-table-widget-config', ConfigurationType.TableWidget
            ), null, true, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(mailFilterConditionWidget);

        const headerTableWidgetConfig = new TableWidgetConfiguration(
            'mail-filter-details-header-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.MAIL_FILTER_SET, ['Key', SortOrder.UP], null, null, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(headerTableWidgetConfig);

        const mailFilterHeaderWidget = new WidgetConfiguration(
            'mail-filter-details-header-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Set Email Headers', [],
            new ConfigurationDefinition(
                'mail-filter-details-header-table-widget-config', ConfigurationType.TableWidget
            ), null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(mailFilterHeaderWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [], [],
            [
                new ConfiguredWidget('mail-filter-details-tab-widget', 'mail-filter-details-tab-widget'),
                new ConfiguredWidget(
                    'mail-filter-details-conditions-table-widget', 'mail-filter-details-conditions-table-widget'
                ),
                new ConfiguredWidget(
                    'mail-filter-details-header-table-widget', 'mail-filter-details-header-table-widget'
                )
            ],
            [],
            [
                'mail-filter-create'
            ],
            [
                'mail-filter-edit', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('mail-filter-details-object-info-widget', 'mail-filter-details-object-info-widget')
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
