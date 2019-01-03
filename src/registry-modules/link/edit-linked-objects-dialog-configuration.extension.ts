import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    EditLinkedObjectsDialogContext,
    EditLinkedObjectsDialogContextConfiguration
} from "../../core/browser/link";

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
