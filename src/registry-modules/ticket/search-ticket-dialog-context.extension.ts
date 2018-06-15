import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { TicketSearchContextConfiguration, TicketSearchContext } from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, FormField, KIXObjectType,
    TicketProperty, FormContext, Form
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new TicketSearchContextConfiguration(TicketSearchContext.CONTEXT_ID, [], [], [], [], []);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formIdNewTicket = 'search-ticket-form';
        const existingFormNewTicket = configurationService.getModuleConfiguration(formIdNewTicket, null);
        if (!existingFormNewTicket) {
            const fulltextField = new FormField("Volltext", TicketProperty.FULLTEXT, false, "Volltext");

            const form = new Form(
                formIdNewTicket,
                'Ticketsuche',
                [
                    new FormGroup('Volltext', [fulltextField])
                ],
                KIXObjectType.TICKET,
                false,
                FormContext.SEARCH
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formIdNewTicket);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
