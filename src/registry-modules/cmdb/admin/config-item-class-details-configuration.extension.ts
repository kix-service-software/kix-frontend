import { IConfigurationExtension } from '../../../core/extensions';
import { ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize } from '../../../core/model';
import { TicketTypeDetailsContext } from '../../../core/browser/ticket';
import { ConfigItemClassDetailsContextConfiguration } from '../../../core/browser/cmdb';

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

        const ciClassPermissionsWidget = new ConfiguredWidget(
            'config-item-class-permissions-widget', new WidgetConfiguration(
                'config-item-class-permissions-widget', 'Translatable#CI Class permissions',
                ['cmdb-admin-ci-class-edit'], null, true, true, WidgetSize.BOTH, null, false
            )
        );

        const ciClassVersionsWidget = new ConfiguredWidget(
            'config-item-class-versions-widget', new WidgetConfiguration(
                'config-item-class-versions-widget', 'Translatable#CI Class versions',
                ['cmdb-admin-ci-class-edit'], null,
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

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
