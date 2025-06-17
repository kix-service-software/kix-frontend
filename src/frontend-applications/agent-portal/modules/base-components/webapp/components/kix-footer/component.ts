/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXModulesSocketClient } from '../../../../../modules/base-components/webapp/core/KIXModulesSocketClient';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ReleaseInfo } from '../../../../../model/ReleaseInfo';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { SysConfigService } from '../../../../sysconfig/webapp/core/SysConfigService';
import { AgentPortalConfiguration } from '../../../../../model/configuration/AgentPortalConfiguration';

class Component {

    public state: ComponentState;
    private releaseInfo: ReleaseInfo;
    private unauthorized: boolean;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.releaseInfo = !this.releaseInfo ? input.releaseInfo : this.releaseInfo;
        this.state.imprintLink = !this.state.imprintLink ? input.imprintLink : this.state.imprintLink;
        this.unauthorized = typeof input.unauthorized !== 'undefined' ? input.unauthorized : false;
    }

    public async onMount(): Promise<void> {
        await this.prepareImprintLink();

        if (!this.releaseInfo) {
            this.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }

        if (!this.unauthorized) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            this.state.currentUserLogin = currentUser.UserLogin;
        }

        this.prepareKIXVersions();

        const apConfig = await SysConfigService.getInstance().getPortalConfiguration<AgentPortalConfiguration>();
        this.state.footerInformation = apConfig?.footerInformation || [];

    }

    private async prepareImprintLink(): Promise<void> {
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
    }

    private prepareKIXVersions(): void {
        this.state.kixVersion = `${this.releaseInfo?.product || 'KIX'} ${this.releaseInfo?.version || '18'}`;
    }

}

module.exports = Component;
