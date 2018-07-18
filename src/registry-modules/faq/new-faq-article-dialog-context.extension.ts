import { ContextConfiguration } from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { NewContactDialogContextConfiguration, NewContactDialogContext } from "@kix/core/dist/browser/contact";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewContactDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        // TODO: Form
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
