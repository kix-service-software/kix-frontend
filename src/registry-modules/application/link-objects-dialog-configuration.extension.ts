import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { LinkObjectDialogContext, LinkObjectDialogContextConfiguration } from "../../core/browser/link";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return LinkObjectDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new LinkObjectDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
