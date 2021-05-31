/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import * as Bowser from 'bowser';
import { AgentService } from '../../../user/webapp/core/AgentService';

class Component {

    public state: ComponentState;

    private redirectUrl: string;

    private translations: Array<[string, string]>;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.logout = input.logout;
        this.redirectUrl = input.redirectUrl;
    }

    public onMount(): void {
        this.initTranslations();
        this.checkBrowser();
        this.state.loading = false;
        setTimeout(() => {
            const userElement = (this as any).getEl('login-user-name');
            if (userElement) {
                userElement.focus();
            }
        }, 200);
    }

    private initTranslations(): void {
        this.translations = [
            ['Welcome to KIX', 'Willkommen bei KIX'],
            [
                'Note: For optimal use of KIX, we recommend alternative browsers such as Chromium or Firefox.',
                // tslint:disable-next-line:max-line-length
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

    private async login(event: any): Promise<void> {
        this.state.logout = false;

        let userName: string;
        let password: string;

        const userElement = (this as any).getEl('login-user-name');
        if (userElement) {
            userName = userElement.value;
        }

        const passwordElement = (this as any).getEl('login-user-password');
        if (passwordElement) {
            password = passwordElement.value;
        }

        if (userName && userName !== '' && password && password !== '') {
            this.state.error = false;
            const login = await AgentService.getInstance().login(userName, password, this.redirectUrl);
            if (!login) {
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
        if (window.navigator) {
            const userLang = window.navigator.language;
            if (userLang.indexOf('de') >= 0 && this.translations.some((t) => t[0] === pattern)) {
                const translation = this.translations.find((t) => t[0] === pattern);
                return translation[1];
            }
        }
        return pattern;
    }
}

module.exports = Component;
