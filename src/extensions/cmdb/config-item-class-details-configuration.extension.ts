import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetSettings,
    KIXObjectType, PermissionProperty, SortOrder, ConfigItemClassDefinitionProperty, TabWidgetSettings
} from '../../core/model';
import { TicketTypeDetailsContext } from '../../core/browser/ticket';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, ToggleOptions } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'config-item-class-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('config-item-class-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['config-item-class-details-widget']))
        );

        const ciClassInfoWidget = new ConfiguredWidget(
            'config-item-class-details-widget', new WidgetConfiguration(
                'config-item-class-info-widget', 'Translatable#CI Class Information',
                ['cmdb-admin-ci-class-edit'], null,
                false, true, null, false
            )
        );

        const ciClassObjectPermissionsWidget = new ConfiguredWidget(
            'ci-class-permissions-widget', new WidgetConfiguration(
                'table-widget', 'Translatable#Permissions',
                [],
                new TableWidgetSettings(
                    KIXObjectType.PERMISSION, [PermissionProperty.RoleID, SortOrder.UP],
                    new TableConfiguration(KIXObjectType.PERMISSION, null, null, null, null, null, null, null, null,
                        TableHeaderHeight.SMALL, TableRowHeight.SMALL), null, false
                ),
                true, true, null, true
            )
        );

        const ciClassDependentObjectPermissionsWidget = new ConfiguredWidget(
            'ci-class-permissions-dependent-objects-widget', new WidgetConfiguration(
                'table-widget',
                'Translatable#Permissions on dependent objects',
                [],
                new TableWidgetSettings(
                    KIXObjectType.PERMISSION_DEPENDING_OBJECTS, [PermissionProperty.RoleID, SortOrder.UP],
                    new TableConfiguration(
                        KIXObjectType.PERMISSION_DEPENDING_OBJECTS, null, null, null, null, null, null, null, null,
                        TableHeaderHeight.SMALL, TableRowHeight.SMALL
                    ), null, false
                ),
                true, true, null, true
            )
        );

        const ciClassVersionsWidget = new ConfiguredWidget(
            'ci-class-versions-widget', new WidgetConfiguration(
                'table-widget', 'Translatable#Version Details',
                [], new TableWidgetSettings(
                    KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION,
                    [ConfigItemClassDefinitionProperty.VERSION, SortOrder.DOWN],
                    new TableConfiguration(
                        KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, null, null, null, true,
                        new ToggleOptions('config-item-class-definition', 'definition', [], true), null,
                        TableHeaderHeight.LARGE, TableRowHeight.LARGE
                    ), null, false
                ),
                false, true, null, false
            )
        );

        return new ContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            [
                'config-item-class-details-widget',
                'ci-class-permissions-widget',
                'ci-class-permissions-dependent-objects-widget'
            ],
            [
                tabLane,
                ciClassObjectPermissionsWidget,
                ciClassDependentObjectPermissionsWidget,
                ciClassInfoWidget
            ],
            ['ci-class-versions-widget'], [ciClassVersionsWidget],
            ['cmdb-admin-ci-class-create'],
            ['cmdb-admin-ci-class-edit']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
