/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from "../../../model/configuration/IConfiguration";
import { ModuleConfigurationService } from "./ModuleConfigurationService";

export class ResolverUtil {


    public static async loadConfigurations<T extends IConfiguration>(
        token: string, ids: string[], configurations: T[]
    ): Promise<T[]> {

        if (!configurations) {
            configurations = [];
        }

        let newConfigurations: T[] = [];

        const idsToLoad = ids.filter((cid) => !configurations.some((c) => c.id === cid));
        const loadedConfigurations = await ModuleConfigurationService.getInstance().loadConfigurations<T>(
            token, idsToLoad
        );

        for (const configId of ids) {
            let configuration = configurations.find((c) => c.id === configId);
            if (!configuration) {
                configuration = loadedConfigurations.find((c) => c.id === configId);
            }
            if (configuration) {
                newConfigurations.push((configuration));
            }
        }

        newConfigurations = [
            ...newConfigurations,
            ...configurations.filter((c) => !ids.some((cid) => cid === c.id))
        ];

        return newConfigurations;

    }

}
