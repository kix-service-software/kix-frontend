import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    Form, FormField, TicketProperty, ArticleProperty, FormContext,
    KIXObjectType, FormFieldOption, FormFieldValue
} from '@kix/core/dist/model';
import { TicketContextConfiguration } from '@kix/core/dist/browser/ticket';

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
