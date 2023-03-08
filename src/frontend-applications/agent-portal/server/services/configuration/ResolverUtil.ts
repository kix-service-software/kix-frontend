/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';

export class ResolverUtil {

    public static async loadConfigurations<T extends IConfiguration>(
        token: string, ids: string[], configurations: T[], sysConfigOptions: SysConfigOption[]
    ): Promise<T[]> {

        if (!configurations) {
            configurations = [];
        }
        if (!ids) {
            ids = [];
        }

        let newConfigurations: T[] = [];

        const idsToLoad = ids.filter((cid) => !configurations.some((c) => c.id === cid));

        const loadedOptions = idsToLoad
            ? sysConfigOptions.filter((o) => idsToLoad.some((id) => o.Value && id === o.Name))
            : [];

        const loadedConfigurations = loadedOptions.map((o) => JSON.parse(o.Value));

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

        // some user created config does not have a valid property but should not be ignored now,
        // so no valid property at all is assumed as valid, too (KIX2018-8156)
        newConfigurations = newConfigurations.filter((c) => typeof c.valid === 'undefined' || c.valid === true);

        return newConfigurations;

    }

}
