import { IConfigurationExtension } from '../../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetSettings,
    KIXObjectType, PermissionProperty, SortOrder, ConfigItemClassDefinitionProperty
} from '../../../core/model';
import { TicketTypeDetailsContext } from '../../../core/browser/ticket';
import { ConfigItemClassDetailsContextConfiguration } from '../../../core/browser/cmdb';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, ToggleOptions } from '../../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'config-item-class-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ciClassDetailsWidget = new ConfiguredWidget(
            'config-item-class-details-widget', new WidgetConfiguration(
                'config-item-class-info-widget', 'Translatable#CI Class information',
                ['cmdb-admin-ci-class-edit'], null,
                false, true, WidgetSize.BOTH, null, false
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
                true, true, WidgetSize.BOTH, null, true
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
                true, true, WidgetSize.BOTH, null, true
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
                false, true, WidgetSize.BOTH, null, false
            )
        );

        return new ConfigItemClassDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ci-class-permissions-widget', 'ci-class-permissions-dependent-objects-widget'],
            [ciClassObjectPermissionsWidget, ciClassDependentObjectPermissionsWidget],
            ['config-item-class-details-widget'], [ciClassDetailsWidget],
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
