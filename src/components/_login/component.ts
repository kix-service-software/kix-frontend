import { ComponentState } from './ComponentState';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { AuthenticationService } from '@kix/core/dist/browser/authentication';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.logout = input.logout;
        this.state.releaseInfo = input.releaseInfo;
    }

    public onMount(): void {
        if (this.state.logout) {
            ClientStorageService.destroyToken();
        }
        this.state.loading = false;
        setTimeout(() => {
            if (!this.state.userName) {
                const userNameElement = (this as any).getEl('login-user-name');
                if (userNameElement) {
                    userNameElement.focus();
                }
            }
        }, 200);
    }

    public userNameChanged(event: any): void {
        this.state.userName = event.target.value;
    }

    public passwordChanged(event: any): void {
        this.state.password = event.target.value;
    }

    private async login(event: any): Promise<void> {
        if (this.state.userName && this.state.userName !== '' && this.state.password && this.state.password !== '') {
            this.state.error = false;
            const login = await AuthenticationService.getInstance().login(this.state.userName, this.state.password);
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
