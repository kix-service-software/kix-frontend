/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { ContextMode } from '../../../../../../model/ContextMode';
import { DialogService } from '../../../../../../modules/base-components/webapp/core/DialogService';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ComponentContent } from '../../../../../../modules/base-components/webapp/core/ComponentContent';
import { ToastContent } from '../../../../../../modules/base-components/webapp/core/ToastContent';
import { OverlayService } from '../../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../modules/base-components/webapp/core/OverlayType';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { ContextHistory } from '../../../../../../modules/base-components/webapp/core/ContextHistory';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import {
    AuthenticationSocketClient
} from '../../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextFactory } from '../../../../../base-components/webapp/core/ContextFactory';
import { ObjectIconLoadingOptions } from '../../../../../../server/model/ObjectIconLoadingOptions';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';

class Component {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Personal Settings", "Translatable#Switch to customer portal.",
            "Translatable#Help", "Translatable#Logout"
        ]);

        const logoLoadingOptions = new ObjectIconLoadingOptions('agent-portal-logo', 'agent-portal-logo');
        const icons = await KIXObjectService.loadObjects<ObjectIcon>(
            KIXObjectType.OBJECT_ICON, null, null, logoLoadingOptions
        );
        if (icons && icons.length) {
            this.state.logoIcon = icons[0];
        }

        const dialogs = ContextFactory.getInstance().getContextDescriptors(ContextMode.CREATE);
        this.state.allowNew = dialogs && (dialogs.length > 0);
    }

    public openDialog(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE, null, true);
    }

    public async showTemporaryComingSoon(): Promise<void> {
        const text = await TranslationService.translate('Translatable#We are working on this functionality.');
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-magicwand', text, 'Coming Soon')
        );
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

    public showPersonalSettings(): void {
        // TODO: there should be a module which register the action to open
        // this Dialog to avoid unnecessary dependencies
        ContextService.getInstance().setDialogContext(
            'personal-settings-dialog-context', KIXObjectType.PERSONAL_SETTINGS,
            ContextMode.PERSONAL_SETTINGS, null, true
        );
    }

    public getReleaseRoutingConfig(): RoutingConfiguration {
        // TODO: there should be a module which register the action to open
        // this Dialog to avoid unnecessary dependencies
        return new RoutingConfiguration(
            'release', null, ContextMode.DASHBOARD, null
        );
    }

    public async logout(): Promise<void> {
        ContextHistory.getInstance().removeBrowserListener();
        await AuthenticationSocketClient.getInstance().logout();
    }

}

module.exports = Component;
