import { ContextConfiguration } from "../../model";

export interface IConfigurationExtension {

    getModuleId(): string;

    getDefaultConfiguration(token: string): Promise<ContextConfiguration>;

    createFormDefinitions(overwrite: boolean): Promise<void>;

}
