import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { ImportDialogContext, ImportDialogContextConfiguration } from "../../core/browser/import";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ImportDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
