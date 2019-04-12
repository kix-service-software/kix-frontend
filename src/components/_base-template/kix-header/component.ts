import { ClientStorageService } from '../../../core/browser/ClientStorageService';
import { ContextService, OverlayService } from '../../../core/browser';
import { ContextMode, ComponentContent, ToastContent, OverlayType, KIXObjectType } from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
import { ReleaseContext } from '../../../core/browser/release';
import { PersonalSettingsDialogContext } from '../../../core/browser';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';
import { ApplicationEvent } from '../../../core/browser/application';
import { EventService } from '../../../core/browser/event';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

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
    }

    public openDialog(): void {
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
            null, ReleaseContext.CONTEXT_ID, null, ContextMode.DASHBOARD, null
        );
    }

    public async logout(): Promise<void> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Logout ...' }
        );
        await AuthenticationSocketClient.getInstance().logout();
        ClientStorageService.destroyToken();
    }

}

module.exports = KIXHeaderComponent;
