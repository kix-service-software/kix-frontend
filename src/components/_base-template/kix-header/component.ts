/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ClientStorageService } from '../../../core/browser/ClientStorageService';
import { ContextService, OverlayService, DialogService } from '../../../core/browser';
import { ContextMode, ComponentContent, ToastContent, OverlayType, KIXObjectType } from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
import { ReleaseContext } from '../../../core/browser/release';
import { PersonalSettingsDialogContext } from '../../../core/browser';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';
import { ApplicationEvent } from '../../../core/browser/application';
import { EventService } from '../../../core/browser/event';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ContextHistory } from '../../../core/browser/context/ContextHistory';
import { ContextFactory } from '../../../core/browser/context/ContextFactory';

class KIXHeaderComponent {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Personal Settings", "Translatable#Switch to customer portal.",
            "Translatable#Help", "Translatable#Logout"
        ]);

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
        ContextService.getInstance().setDialogContext(
            PersonalSettingsDialogContext.CONTEXT_ID, KIXObjectType.PERSONAL_SETTINGS,
            ContextMode.PERSONAL_SETTINGS, null, true
        );
    }

    public getReleaseRoutingConfig(): RoutingConfiguration {
        return new RoutingConfiguration(
            ReleaseContext.CONTEXT_ID, null, ContextMode.DASHBOARD, null
        );
    }

    public async logout(): Promise<void> {
        ContextHistory.getInstance().removeBrowserListener();
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Logout' }
        );
        await AuthenticationSocketClient.getInstance().logout();
    }

}

module.exports = KIXHeaderComponent;
