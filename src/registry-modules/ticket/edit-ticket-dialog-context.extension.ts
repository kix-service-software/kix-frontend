import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    EditTicketDialogContextConfiguration, EditTicketDialogContext
} from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration
} from '@kix/core/dist/model';

export class EditTicketDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new EditTicketDialogContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};
