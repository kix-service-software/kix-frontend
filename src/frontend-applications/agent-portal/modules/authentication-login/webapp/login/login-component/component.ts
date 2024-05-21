/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import * as Bowser from 'bowser';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { PortalNotificationService } from '../../../../portal-notification/webapp/core/PortalNotificationService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { PortalNotificationEvent } from '../../../../portal-notification/model/PortalNotificationEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { AuthMethod } from '../../../../../model/AuthMethod';
import { UserType } from '../../../../user/model/UserType';

declare const window: Window;

class Component {

    public state: ComponentState;

    private redirectUrl: string;
    private translations: Array<[string, string]>;
    private subscriber: IEventSubscriber;

    private authMethods: AuthMethod[];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.logout = input.logout;
        this.redirectUrl = input.redirectUrl;
        this.authMethods = input.authMethods || [];
        this.state.error = input.error;
    }

    public async onMount(): Promise<void> {
        this.initTranslations();
        this.checkBrowser();

        this.state.loading = false;
        this.state.notifications = await PortalNotificationService.getInstance().getPreLoginNotifications();

        this.subscriber = {
            eventSubscriberId: 'login-component',
            eventPublished: async (): Promise<void> => {
                this.state.notifications = await PortalNotificationService.getInstance().getPreLoginNotifications();
            }
        };
        EventService.getInstance().subscribe(PortalNotificationEvent.PRE_LOGIN_NOTIFICATIONS_UPDATED, this.subscriber);

        if (this.authMethods?.length) {
            this.state.hasLogin = this.authMethods.some((am) => am.type === 'LOGIN');
            this.state.authMethods = this.authMethods.filter((am) => am.type !== 'LOGIN' && am.preAuth);
        }

        setTimeout(() => {
            const userElement = (this as any).getEl('login-user-name');
            if (userElement) {
                userElement.focus();
            }
        }, 200);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(
            PortalNotificationEvent.PRE_LOGIN_NOTIFICATIONS_UPDATED, this.subscriber
        );
    }

    private initTranslations(): void {
        this.translations = [
            ['Welcome to KIX', 'Willkommen bei KIX'],
            [
                'Note: For optimal use of KIX, we recommend alternative browsers such as Chromium or Firefox.',
                'Hinweis: Für die optimale Nutzung von KIX  empfehlen wir alternative Browser wie Chromium oder Firefox.'
            ]
            ,
            ['Login failed', 'Anmeldung fehlgeschlagen'],
            ['You have successfully logged out.', 'Sie haben sich erfolgreich abgemeldet.'],
            ['Login Name', 'Nutzername'],
            ['Password', 'Passwort'],
            ['Login', 'Anmelden']
        ];
    }

    private checkBrowser(): void {
        const browser = Bowser.getParser(window.navigator.userAgent);
        this.state.unsupportedBrowser = !browser.satisfies({
            'chrome': '>60',
            'chromium': '>60',
            'firefox': '>60',
            'microsoft edge': '>18' // EdgeHTML version --> belongs to Edge v44
        });
    }

    public userNameChanged(event: any): void {
        this.state.userName = event?.target?.value;
    }

    public passwordChanged(event: any): void {
        this.state.password = event?.target?.value;
    }

    private async login(event: any): Promise<void> {
        this.state.logout = false;

        if (this.state.userName) {
            this.state.loginProcess = true;
            this.state.error = false;

            const login = await AgentService.getInstance().login(
                this.state.userName, this.state.password, this.redirectUrl
            );

            if (!login) {
                this.state.loginProcess = false;
                this.state.error = true;
            }
        } else {
            this.state.error = true;
        }
    }

    public keyDown(event: any): void {
        // 13 == Enter
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.login(event);
        }
    }

    public getString(pattern: string): string {
        if (typeof window !== 'undefined' && window?.navigator) {
            const userLang = window.navigator.language;
            if (userLang.indexOf('de') >= 0 && this.translations?.some((t) => t[0] === pattern)) {
                const translation = this.translations.find((t) => t[0] === pattern);
                return translation[1];
            }
        }
        return pattern;
    }

    public togglePasswordVisibility(): void {
        this.state.passwordFieldType = this.state.passwordFieldType === InputFieldTypes.PASSWORD.toLowerCase() ?
            InputFieldTypes.TEXT.toLowerCase() : InputFieldTypes.PASSWORD.toLowerCase();
    }

    public async authMethodClicked(method: AuthMethod): Promise<void> {
        this.state.loginProcess = true;
        const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.location.href = `${url}?authmethod=${JSON.stringify(method)}&usertype=${UserType.AGENT}&returnUrl=${encodeURIComponent(url)}&redirectUrl=${encodeURIComponent(this.redirectUrl)}`;
    }
}

module.exports = Component;
