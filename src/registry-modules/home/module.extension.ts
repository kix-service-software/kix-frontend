import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, DataType, ContextConfiguration
} from '@kix/core/dist/model';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { HomeContextConfiguration, HomeContext } from '@kix/core/dist/browser/home';
import { TicketProperty } from '@kix/core/dist/model/';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return HomeContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        return new HomeContextConfiguration(
            this.getModuleId(),
            [],
            [],
            [],
            [],
            [],
            [],
            []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
