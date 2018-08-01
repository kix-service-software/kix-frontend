import { ContextConfiguration } from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { EditLinkObjectDialogContext, EditLinkObjectDialogContextConfiguration } from "@kix/core/dist/browser/link";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditLinkObjectDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new EditLinkObjectDialogContextConfiguration();
    }

    public createFormDefinitions(): void {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
