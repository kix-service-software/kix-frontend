/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ReleaseInfo } from "../frontend-applications/agent-portal/model/ReleaseInfo";

export class ReleaseInfoUtil {

    public static async getReleaseInfo(): Promise<ReleaseInfo> {
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const reader = require('readline').createInterface({
                input: require('fs').createReadStream('./RELEASE')
            });

            const releaseInfo = new ReleaseInfo();
            reader.on('line', (line: string) => {
                const releaseValue = line.split(' = ');
                if (releaseValue && releaseValue.length === 2) {
                    if (releaseValue[0] === 'PRODUCT') {
                        releaseInfo.product = releaseValue[1];
                    } else if (releaseValue[0] === 'VERSION') {
                        releaseInfo.version = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDDATE') {
                        releaseInfo.buildDate = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDHOST') {
                        releaseInfo.buildHost = releaseValue[1];
                    } else if (releaseValue[0] === 'BUILDNUMBER') {
                        releaseInfo.buildNumber = Number(releaseValue[1]);
                    }
                }
            });

            reader.on('close', () => {
                resolve(releaseInfo);
            });
        });
    }

}
