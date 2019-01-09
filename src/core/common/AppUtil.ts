import { PluginService } from "../../services";
import { IConfigurationExtension, KIXExtensions } from "../extensions";

export class AppUtil {

    public static async updateFormConfigurations(overwrite: boolean = false): Promise<void> {
        const moduleFactories = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            KIXExtensions.CONFIGURATION
        );

        for (const mf of moduleFactories) {
            await mf.createFormDefinitions(overwrite);
        }
    }

}
