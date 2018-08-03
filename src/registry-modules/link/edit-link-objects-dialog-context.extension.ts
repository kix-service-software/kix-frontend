import { ContextConfiguration } from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { EditLinkObjectsDialogContext, EditLinkObjectsDialogContextConfiguration } from "@kix/core/dist/browser/link";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditLinkObjectsDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new EditLinkObjectsDialogContextConfiguration();
    }

    public createFormDefinitions(): void {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
