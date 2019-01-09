import { ContextConfiguration } from "../../model";

export interface IConfigurationExtension {

    getModuleId(): string;

    getDefaultConfiguration(): Promise<ContextConfiguration>;

    createFormDefinitions(overwrite: boolean): Promise<void>;

}
