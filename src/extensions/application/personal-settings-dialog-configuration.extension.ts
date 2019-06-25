import { ContextConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { PersonalSettingsDialogContext, PersonalSettingsDialogContextConfiguration } from "../../core/browser";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return PersonalSettingsDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new PersonalSettingsDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
