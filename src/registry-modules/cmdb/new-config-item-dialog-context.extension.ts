import {
    ContextConfiguration, FormField, FormContext, KIXObjectType, Form, FormFieldValue
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";
import { NewFAQArticleDialogContext, NewFAQArticleDialogContextConfiguration } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewFAQArticleDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        // const formId = 'new-config-item-form';
        // const existingForm = configurationService.getModuleConfiguration(formId, null);
        // if (!existingForm) {
        //     const fields: FormField[] = [];

        //     const group = new FormGroup('Config Item Daten', fields);

        //     const form = new Form(formId, 'Neues Config Item', [group], KIXObjectType.CONFIG_ITEM);
        //     await configurationService.saveModuleConfiguration(form.id, null, form);
        // }
        // configurationService.registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM, formId);

        // const linkFormId = 'link-config-item-search-form';
        // const existingLinkForm = configurationService.getModuleConfiguration(linkFormId, null);
        // if (!existingLinkForm) {
        //     const fields: FormField[] = [];

        //     const group = new FormGroup('Config Item Attribute', fields);

        //     const form = new Form(
        //         linkFormId, 'Verknüpfen mit Config Item', [group], KIXObjectType.CONFIG_ITEM, false
        //     );
        //     await configurationService.saveModuleConfiguration(form.id, null, form);
        // }

        // configurationService.registerForm(
        //     [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        // );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
