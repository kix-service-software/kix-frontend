import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { BulkDialogContext, BulkDialogContextConfiguration } from "../../core/browser/bulk";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return BulkDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new BulkDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
