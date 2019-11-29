/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ReleaseInfo, SysConfigOption, KIXObjectType, SysConfigKey } from '../../../core/model';
import { KIXObjectService } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ComponentInput } from './ComponentInput';
import { AgentService } from '../../../core/browser/application/AgentService';
import { KIXModulesSocketClient } from '../../../core/browser/modules/KIXModulesSocketClient';

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
        return `(Build: ${releaseInfo.buildNumber.toString()}.${backendBuildNumber})`;
    }
}

module.exports = Component;
