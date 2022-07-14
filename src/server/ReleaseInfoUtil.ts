/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ReleaseInfo } from '../frontend-applications/agent-portal/model/ReleaseInfo';
import { SystemInfo } from '../frontend-applications/agent-portal/model/SystemInfo';
import { PluginService } from './services/PluginService';

export class ReleaseInfoUtil {

    private static INSTANCE: ReleaseInfoUtil;

    private systemInfo: SystemInfo;

    public static getInstance(): ReleaseInfoUtil {
        if (!ReleaseInfoUtil.INSTANCE) {
            ReleaseInfoUtil.INSTANCE = new ReleaseInfoUtil();
        }
        return ReleaseInfoUtil.INSTANCE;
    }

    private constructor() { }

    public setSysteminfo(systemInfo: SystemInfo): void {
        this.systemInfo = systemInfo;
    }

    public async getReleaseInfo(releaseFile: string = './RELEASE'): Promise<ReleaseInfo> {
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const reader = require('readline').createInterface({
                input: require('fs').createReadStream(releaseFile)
            });

            const releaseInfo = new ReleaseInfo();

            // add plugins
            releaseInfo.plugins = PluginService.getInstance().availablePlugins?.map((p) => p[1]);

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
                    } else if (releaseValue[0] === 'PATCHNUMBER') {
                        releaseInfo.patchNumber = Number(releaseValue[1]);
                    } else if (releaseValue[0] === 'REQUIRES') {
                        releaseInfo.dependencies = this.parseRequirements(releaseValue[1]);
                        releaseInfo.requires = releaseValue[1];
                    }
                }
            });

            reader.on('close', () => {
                releaseInfo.backendSystemInfo = this.systemInfo;
                resolve(releaseInfo);
            });
        });
    }

    private parseRequirements(requirementsDefinition: string): Array<[string, string, string]> {
        const requirements = [];

        if (requirementsDefinition) {
            const requirmentsList = requirementsDefinition.trim().split(',').map((s) => s.trim());
            for (const requirement of requirmentsList) {
                const matches = requirement.match(/([\w, ::]+)(?:\((>|<|=)?(\d+)\))?/);
                requirements.push([
                    matches[1] ? matches[1] : null,
                    matches[2] ? matches[2] : null,
                    matches[3] ? Number(matches[3]) : null,
                ]);
            }
        }

        return requirements;
    }

}
