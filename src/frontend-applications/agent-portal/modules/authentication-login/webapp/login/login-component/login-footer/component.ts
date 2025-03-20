/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../../../sysconfig/model/SysConfigKey';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXModulesSocketClient } from '../../../../../base-components/webapp/core/KIXModulesSocketClient';
import { ReleaseInfo } from '../../../../../../model/ReleaseInfo';

class Component {

    public state: ComponentState;

    private translations: Map<string, string>;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.releaseInfo = input.releaseInfo;
        this.state.imprintLink = input.imprintLink;
    }

    public async onMount(): Promise<void> {
        this.initTranslations();
        if (!this.state.releaseInfo) {
            this.state.releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        }

        if (this.state.releaseInfo) {
            this.state.kixProduct = this.state.releaseInfo.product;
            this.state.kixVersion = this.state.releaseInfo.version;
            this.state.buildNumber = this.getBuildNumber(this.state.releaseInfo);
        }

        if (!this.state.imprintLink) {
            const imprintConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK]
            );

            if (imprintConfig && imprintConfig.length) {
                const data = imprintConfig[0].Value;

                const userLang = navigator.language;
                if (userLang.indexOf('de') >= 0) {
                    this.state.imprintLink = data['de'];
                } else {
                    this.state.imprintLink = data['en'];
                }
            }
        }
    }

    private initTranslations(): void {
        this.translations = new Map();
        this.translations.set('A product by KIX Service Software GmbH', 'Ein Produkt der KIX Service Software GmbH');
        this.translations.set('Imprint', 'Impressum');
    }

    public getString(pattern: string): string {
        if (typeof window !== 'undefined' && window.navigator && this.translations) {
            const userLang = window.navigator.language;
            if (userLang.indexOf('de') >= 0 && this.translations.has(pattern)) {
                const translation = this.translations.get(pattern);
                return translation;
            }
        }
        return pattern;
    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        const backendBuildNumber = releaseInfo.backendSystemInfo ? releaseInfo.backendSystemInfo.BuildNumber : '';
        return `(Build: ${releaseInfo.buildNumber.toString()}.${backendBuildNumber})`;
    }
}

module.exports = Component;
