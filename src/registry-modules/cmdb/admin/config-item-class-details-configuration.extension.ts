import { IConfigurationExtension } from '../../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetSettings,
    KIXObjectType, PermissionProperty, SortOrder
} from '../../../core/model';
import { TicketTypeDetailsContext } from '../../../core/browser/ticket';
import { ConfigItemClassDetailsContextConfiguration } from '../../../core/browser/cmdb';
import { TableConfiguration, TableHeaderHeight, TableRowHeight } from '../../../core/browser';

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
                ['cmdb-admin-ci-class-edit'],
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
                ['cmdb-admin-ci-class-edit'],
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
                'config-item-class-versions-widget', 'Translatable#CI Class versions',
                ['cmdb-admin-ci-class-edit'], null,
                false, true, WidgetSize.BOTH, null, false
            )
        );

        return new ConfigItemClassDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            [
                'ci-class-permissions-widget',
                'ci-class-permissions-dependent-objects-widget',
                'ci-class-versions-widget'
            ],
            [ciClassObjectPermissionsWidget, ciClassDependentObjectPermissionsWidget, ciClassVersionsWidget],
            ['config-item-class-details-widget'], [ciClassDetailsWidget],
            [], [],
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
