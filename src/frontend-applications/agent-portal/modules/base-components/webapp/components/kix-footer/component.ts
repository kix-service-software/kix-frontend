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
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;
    private releaseInfo: ReleaseInfo;
    private unauthorized: boolean;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.releaseInfo = !this.releaseInfo ? input.releaseInfo : this.releaseInfo;
        this.state.imprintLink = !this.state.imprintLink ? input.imprintLink : this.state.imprintLink;
        this.unauthorized = typeof input.unauthorized !== 'undefined' ? input.unauthorized : false;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.prepareImprintLink();

        if (!this.releaseInfo) {
            this.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }

        if (!this.unauthorized) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            this.state.currentUserLogin = currentUser.UserLogin;
        }

        this.prepareKIXVersions();

        const appConfig = await SysConfigService.getInstance().getPortalConfiguration<AgentPortalConfiguration>();
        if (appConfig?.footerInformation) {
            if (typeof appConfig?.footerInformation === 'string') {
                this.state.footerInformation.push(appConfig?.footerInformation);
            } else if (Array.isArray(appConfig?.footerInformation)) {
                this.state.footerInformation = appConfig?.footerInformation.slice(0, 2);
            }
            // FIXME: This should be removed once the revised layout structure (KIX2018-14141) is implemented,
            // provided it has been taken into account.
            let component = document.querySelector('.content-wrapper');
            component['style'].marginBottom = 2 + (1.1 * this.state.footerInformation.length) + 'rem';
        }
    }

    public onDestroy(): void {
        super.onDestroy();
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
