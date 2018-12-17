import { IConfigurationExtension } from '@kix/core/dist/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '@kix/core/dist/model';
import { TicketTypeDetailsContext } from '@kix/core/dist/browser/ticket';
import { ConfigItemClassDetailsContextConfiguration } from '@kix/core/dist/browser/cmdb';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'config-item-class-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ciClassDetailsWidget = new ConfiguredWidget(
            'config-item-class-details-widget', new WidgetConfiguration(
                'config-item-class-info-widget', 'CMDB Klassen Informationen', ['cmdb-admin-ci-class-edit'], null,
                false, true, WidgetSize.BOTH, null, false
            )
        );

        const ciClassPermissionsWidget = new ConfiguredWidget(
            'config-item-class-permissions-widget', new WidgetConfiguration(
                'config-item-class-permissions-widget', 'CMDB Klassen Berechtigungen',
                ['cmdb-admin-ci-class-edit'], null, true, true, WidgetSize.BOTH, null, false
            )
        );

        const ciClassVersionsWidget = new ConfiguredWidget(
            'config-item-class-versions-widget', new WidgetConfiguration(
                'config-item-class-versions-widget', 'CMDB Klassen Versionen', ['cmdb-admin-ci-class-edit'], null,
                false, true, WidgetSize.BOTH, null, false
            )
        );

        return new ConfigItemClassDetailsContextConfiguration(
            TicketTypeDetailsContext.CONTEXT_ID, [], [], [], [],
            ['config-item-class-permissions-widget', 'config-item-class-versions-widget'],
            [ciClassPermissionsWidget, ciClassVersionsWidget],
            ['config-item-class-details-widget'], [ciClassDetailsWidget],
            [], [],
            ['cmdb-admin-ci-class-create'],
            ['cmdb-admin-ci-class-edit']
        );
    }

    public createFormDefinitions(): void {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
