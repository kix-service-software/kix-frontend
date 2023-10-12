/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';
import { FAQDetailsContext } from '../../../../faq/webapp/core/context/FAQDetailsContext';
import { AuthenticationSocketClient } from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public baseFAQUri: string;

    public onCreate(input: any): void {
        this.baseFAQUri = 'faqarticles/';
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Help, hints & tricks',
            'Translatable#Field Agent App',
            'Field Agent App (Android)',
            'Field Agent App (iOS)',
            'Translatable#Manuals',
            'Translatable#User Manual',
            'Translatable#Admin Manual',
            'Translatable#Self Service Manual',
            'Translatable#KIX Forum',
            'Translatable#Quick Start Guide'
        ]);

        const language = await TranslationService.getUserLanguage();

        this.state.hasFAQAccess = await this.checkReadPermissions('faq/articles');

        if (this.state.hasFAQAccess) {
            this.preapreFAQIds(language);
        }

        if (language === 'de') {
            this.state.appleImg = 'app-store_de.png';
            this.state.googleImg = 'google-play_de.png';
        }

        this.state.hasConfigAccess = await this.checkReadPermissions('system/config');
        if (this.state.hasConfigAccess) {
            await this.prepareManualLinks(language);
        }
    }

    public faqClicked(id: number, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setActiveContext(FAQDetailsContext.CONTEXT_ID, id);
    }

    private async checkReadPermissions(resource: string): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [CRUD.READ])]
        );
    }

    private async prepareManualLinks(language: string): Promise<void> {
        const selfServiceConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.SELF_SERVICE_MANUAL]
        );
        this.state.selfServiceManualLink = selfServiceConfigs && selfServiceConfigs.length
            ? selfServiceConfigs[0].Value
            : null;
        if (typeof this.state.selfServiceManualLink === 'object') {
            this.state.selfServiceManualLink = this.state.selfServiceManualLink[language]
                ? this.state.selfServiceManualLink[language]
                : this.state.selfServiceManualLink['de'];
        }

        const userManualConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.USER_MANUAL]
        );
        this.state.userManualLink = userManualConfigs && userManualConfigs.length
            ? userManualConfigs[0].Value
            : null;
        if (typeof this.state.userManualLink === 'object') {
            this.state.userManualLink = this.state.userManualLink[language]
                ? this.state.userManualLink[language]
                : this.state.userManualLink['de'];
        }

        const adminManualConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ADMIN_MANUAL]
        );
        this.state.adminManualLink = adminManualConfigs && adminManualConfigs.length
            ? adminManualConfigs[0].Value
            : null;
        if (typeof this.state.adminManualLink === 'object') {
            this.state.adminManualLink = this.state.adminManualLink[language]
                ? this.state.adminManualLink[language]
                : this.state.adminManualLink['de'];
        }
    }

    private async preapreFAQIds(language: string): Promise<void> {
        this.state.faqIds = language === 'de' ? [1, 7, 5, 3] : [2, 8, 6, 4];
    }

}

module.exports = Component;
