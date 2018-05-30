import {
    ContextConfiguration, FormField, ContactSourceAttributeMapping, Form, FormContext, KIXObjectType
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    NewContactDialogContextConfiguration, NewContactDialogContext
} from "@kix/core/dist/browser/contact";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService, IContactService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";

export class NewContactDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewContactDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        // TODO: form zeug
    }

}

module.exports = (data, host, options) => {
    return new NewContactDialogModuleExtension();
};
