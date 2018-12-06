import { ContextConfiguration } from "@kix/core/dist/model";
import { IConfigurationExtension } from "@kix/core/dist/extensions";
import {
    EditLinkedObjectsDialogContext,
    EditLinkedObjectsDialogContextConfiguration
} from "@kix/core/dist/browser/link";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditLinkedObjectsDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new EditLinkedObjectsDialogContextConfiguration();
    }

    public createFormDefinitions(): void {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
