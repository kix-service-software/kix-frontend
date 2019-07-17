import { PluginService } from "../../services";
import { IConfigurationExtension, KIXExtensions } from "../extensions";
import { Environment } from "./Environment";

export class AppUtil {

    public static async updateFormConfigurations(overwrite: boolean = false): Promise<void> {
        const moduleFactories = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            KIXExtensions.CONFIGURATION
        );

        for (const mf of moduleFactories) {
            await mf.createFormDefinitions(overwrite);
        }
    }

    public static isProductionMode(): boolean {
        const environment = this.getEnvironment();
        return environment === Environment.PRODUCTION ||
            (environment !== Environment.DEVELOPMENT && environment !== Environment.TEST);
    }

    public static isDevelopmentMode(): boolean {
        return this.getEnvironment() === Environment.DEVELOPMENT;
    }

    public static isTestMode(): boolean {
        return this.getEnvironment() === Environment.TEST;
    }

    private static getEnvironment(): string {
        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv) {
            nodeEnv = Environment.PRODUCTION;
        }

        return nodeEnv.toLocaleLowerCase();
    }

}
