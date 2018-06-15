import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    WidgetConfiguration, WidgetType, ConfiguredWidget, WidgetSize, Form,
    FormField, TicketProperty, ArticleProperty, DataType, FormContext, KIXObjectType, FormFieldOption
} from '@kix/core/dist/model';
import {
    TicketContextConfiguration, ArticleLabelProvider,
    TicketStateOptions
} from '@kix/core/dist/browser/ticket';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { TableColumnConfiguration } from '@kix/core/dist/browser';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "tickets";
    }

    public getDefaultConfiguration(): any {
        return new TicketContextConfiguration(this.getModuleId(), [], [], [], [], []);
    }

    public async createFormDefinitions(): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
