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
    ContextConfiguration, ObjectInformationWidgetConfiguration, KIXObjectType,
    JobProperty, KIXObjectProperty, WidgetConfiguration, ConfiguredWidget, TabWidgetConfiguration,
    TableWidgetConfiguration, SortOrder
} from '../../core/model';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'job-details';
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new ObjectInformationWidgetConfiguration(
                'job-details-object-info-config', 'Object Info Config', ConfigurationType.ObjectInformation,
                KIXObjectType.JOB,
                [
                    JobProperty.NAME,
                    JobProperty.LAST_EXEC_TIME,
                    KIXObjectProperty.COMMENT,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CHANGE_TIME,
                    KIXObjectProperty.CHANGE_BY
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new WidgetConfiguration(
                'job-details-info-widget', 'Job Information', ConfigurationType.Widget,
                'object-information-widget', 'Translatable#Job Information', [],
                new ConfigurationDefinition('job-details-object-info-config', ConfigurationType.ObjectInformation)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new TabWidgetConfiguration(
                'jod-details-tab-widget-config', 'Tab widget config', ConfigurationType.TabWidget,
                [
                    'job-details-info-widget'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new WidgetConfiguration(
                'job-details-tab-widget', 'Tab widget', ConfigurationType.Widget,
                'tab-widget', '', [],
                new ConfigurationDefinition('jod-details-tab-widget-config', ConfigurationType.TabWidget)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new WidgetConfiguration(
                'job-details-exec-plans-widget', 'Exec Plan Widget', ConfigurationType.Widget,
                'job-details-exec-plans-widget', 'Translatable#Execution Plan', []
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new TableWidgetConfiguration(
                'job-details-filter-table-widget-config', 'Widget Config', ConfigurationType.TableWidget,
                KIXObjectType.JOB_FILTER, ['Field', SortOrder.UP], null, null, null, false
            )
        );


        await ModuleConfigurationService.getInstance().saveConfiguration(
            new WidgetConfiguration(
                'job-details-filter-widget', 'Table Widget', ConfigurationType.Widget,
                'table-widget', 'Translatable#Filter', [],
                new ConfigurationDefinition(
                    'job-details-filter-table-widget-config', ConfigurationType.TableWidget
                ), null, false, true, null, true
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new TableWidgetConfiguration(
                'job-details-actions-table-widget-config', 'Widget Config', ConfigurationType.TableWidget,
                KIXObjectType.MACRO_ACTION, null, null, null, null, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new WidgetConfiguration(
                'job-details-actions-widget', 'Actions Widget', ConfigurationType.Widget,
                'table-widget', 'Translatable#Actions', [],
                new ConfigurationDefinition(
                    'job-details-actions-table-widget-config', ConfigurationType.TableWidget
                ), null, false, true, null, true
            )
        );

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [], [],
            [
                new ConfiguredWidget('job-details-tab-widget', 'job-details-tab-widget'),
                new ConfiguredWidget('job-details-exec-plans-widget', 'job-details-exec-plans-widget'),
                new ConfiguredWidget('job-details-filter-widget', 'job-details-filter-widget'),
                new ConfiguredWidget('job-details-actions-widget', 'job-details-actions-widget')
            ],
            [],
            ['job-create-action'], ['job-edit-action', 'job-execute-action'], [],
            [
                new ConfiguredWidget('job-details-info-widget', 'job-details-info-widget')
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
