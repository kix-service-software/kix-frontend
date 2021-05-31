/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { FAQDetailsContext } from '../../../../faq/webapp/core/context/FAQDetailsContext';
import { ContextMode } from '../../../../../model/ContextMode';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import {
    AuthenticationSocketClient
} from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
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
            'Translatable#Help, hints & tricks', 'Translatable#Field Agent App',
            'Field Agent App (Android)', 'Field Agent App (iOS)'
        ]);
        this.state.hasFAQAccess = await this.checkReadPermissions('faq/articles');

        if (this.state.hasFAQAccess) {
            this.preapreFAQIds();
        }

        this.state.hasConfigAccess = await this.checkReadPermissions('system/config');
        if (this.state.hasConfigAccess) {
            const userManualConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.USER_MANUAL]
            );
            this.state.userManualLink = userManualConfigs && !!userManualConfigs.length ?
                userManualConfigs[0].Value : null;
            const adminManualConfigs = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ADMIN_MANUAL]
            );
            this.state.adminManualLink = adminManualConfigs && !!adminManualConfigs.length ?
                adminManualConfigs[0].Value : null;
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

    private async preapreFAQIds(): Promise<void> {
        const language = await TranslationService.getUserLanguage();

        const isGerman = language === 'de';

        this.state.faqIds = isGerman ? [1, 7, 5, 3] : [2, 8, 6, 4];
    }

}

module.exports = Component;
