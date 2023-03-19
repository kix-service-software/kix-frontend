/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { KIXModulesSocketClient } from '../../../../../modules/base-components/webapp/core/KIXModulesSocketClient';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ReleaseInfo } from '../../../../../model/ReleaseInfo';
import { AgentService } from '../../../../user/webapp/core/AgentService';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.releaseInfo = !this.state.releaseInfo ? input.releaseInfo : this.state.releaseInfo;
        this.state.imprintLink = !this.state.imprintLink ? input.imprintLink : this.state.imprintLink;
        this.state.unauthorized = typeof input.unauthorized !== 'undefined' ? input.unauthorized : false;
    }

    public async onMount(): Promise<void> {
        if (!this.state.imprintLink) {
            const imprintConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK]
            );

            if (imprintConfig && imprintConfig.length) {
                const userLanguage = await TranslationService.getUserLanguage();
                const data = imprintConfig[0].Value;
                if (data[userLanguage]) {
                    this.state.imprintLink = data[userLanguage];
                } else {
                    const defaultLanguage = await TranslationService.getSystemDefaultLanguage();
                    this.state.imprintLink = data[defaultLanguage];
                }
            }
        }

        if (!this.state.releaseInfo) {
            this.state.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }

        if (!this.state.unauthorized) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            this.state.currentUserLogin = currentUser.UserLogin;
        }

        if (this.state.releaseInfo) {
            this.state.kixProduct = this.state.releaseInfo.product;
            this.state.kixVersion = this.state.releaseInfo.version;
            this.state.buildNumber = this.getBuildNumber(this.state.releaseInfo);
        }

    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        const backendBuildNumber = releaseInfo.backendSystemInfo ? releaseInfo.backendSystemInfo.BuildNumber : '';
        const backendPatchNumber = releaseInfo.backendSystemInfo ? releaseInfo.backendSystemInfo.PatchNumber : '';
        return `(Build: ${releaseInfo.buildNumber.toString()}-${releaseInfo.patchNumber.toString()}.${backendBuildNumber}-${backendPatchNumber})`;
    }
}

module.exports = Component;
