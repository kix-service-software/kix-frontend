/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { MailFilterDetailsContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ObjectInformationWidgetConfiguration } from '../../model/configuration/ObjectInformationWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { MailFilterProperty } from './model/MailFilterProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { SortOrder } from '../../model/SortOrder';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailFilterDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
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
        configurations.push(objectInfoConfig);

        const mailFilterInfoLane = new WidgetConfiguration(
            'mail-filter-details-object-info-widget', 'Info WIdget', ConfigurationType.Widget,
            'object-information-widget', 'Translatable#Email Filter Information', [],
            new ConfigurationDefinition('mail-filter-object-info-config', ConfigurationType.ObjectInformation),
            null, false, true, null, false
        );
        configurations.push(mailFilterInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'mail-filter-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['mail-filter-details-object-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'mail-filter-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('mail-filter-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        const conditionsTableWidgetConfig = new TableWidgetConfiguration(
            'mail-filter-details-conditions-table-widget-config', 'Table Widget Config',
            ConfigurationType.TableWidget,
            KIXObjectType.MAIL_FILTER_MATCH, ['Key', SortOrder.UP], null, null, null, false
        );
        configurations.push(conditionsTableWidgetConfig);

        const mailFilterConditionWidget = new WidgetConfiguration(
            'mail-filter-details-conditions-table-widget', 'Table WIdget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Filter Conditions', [],
            new ConfigurationDefinition(
                'mail-filter-details-conditions-table-widget-config', ConfigurationType.TableWidget
            ), null, true, true, null, true
        );
        configurations.push(mailFilterConditionWidget);

        const headerTableWidgetConfig = new TableWidgetConfiguration(
            'mail-filter-details-header-table-widget-config', 'Table Widget Config', ConfigurationType.TableWidget,
            KIXObjectType.MAIL_FILTER_SET, ['Key', SortOrder.UP], null, null, null, false
        );
        configurations.push(headerTableWidgetConfig);

        const mailFilterHeaderWidget = new WidgetConfiguration(
            'mail-filter-details-header-table-widget', 'Table Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Set Email Headers', [],
            new ConfigurationDefinition(
                'mail-filter-details-header-table-widget-config', ConfigurationType.TableWidget
            ), null, false, true, null, true
        );
        configurations.push(mailFilterHeaderWidget);

        configurations.push(
            new ContextConfiguration(
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
                    'mail-filter-duplicate', 'mail-filter-edit'
                ],
                [],
                [
                    new ConfiguredWidget(
                        'mail-filter-details-object-info-widget', 'mail-filter-details-object-info-widget'
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
