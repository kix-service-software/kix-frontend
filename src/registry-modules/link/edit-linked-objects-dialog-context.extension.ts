import { ContextConfiguration } from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    EditLinkedObjectsDialogContext,
    EditLinkedObjectsDialogContextConfiguration
} from "@kix/core/dist/browser/link";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return EditLinkedObjectsDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new EditLinkedObjectsDialogContextConfiguration();
    }

    public createFormDefinitions(): void {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
