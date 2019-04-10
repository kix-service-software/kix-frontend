import { ComponentState } from './ComponentState';
import { ClientStorageService } from '../../core/browser/ClientStorageService';
import { AgentService } from '../../core/browser/application/AgentService';
import * as Bowser from "bowser";

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.logout = input.logout;
    }

    public onMount(): void {
        if (this.state.logout) {
            ClientStorageService.destroyToken();
        }
        this.checkBrowser();
        this.state.loading = false;
        setTimeout(() => {
            const userElement = (this as any).getEl('login-user-name');
            if (userElement) {
                userElement.focus();
            }
        }, 200);
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

        let userName;
        let password;

        const userElement = (this as any).getEl("login-user-name");
        if (userElement) {
            userName = userElement.value;
        }

        const passwordElement = (this as any).getEl("login-user-password");
        if (passwordElement) {
            password = passwordElement.value;
        }

        if (userName && userName !== '' && password && password !== '') {
            this.state.error = false;
            const login = await AgentService.getInstance().login(userName, password);
            if (login) {
                window.location.replace('/');
            } else {
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
}

module.exports = Component;
