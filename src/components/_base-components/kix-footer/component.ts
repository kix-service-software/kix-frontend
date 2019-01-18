import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { ReleaseInfo } from '../../../core/model';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.releaseInfo = input.releaseInfo;
    }

    public async onMount(): Promise<void> {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.currentUserLogin = objectData.currentUser.UserLogin;

        if (!this.state.releaseInfo) {
            this.state.releaseInfo = objectData.releaseInfo;
        }

        if (this.state.releaseInfo) {
            this.state.kixProduct = this.state.releaseInfo.product;
            this.state.kixVersion = this.state.releaseInfo.version;
            this.state.buildNumber = this.getBuildNumber(this.state.releaseInfo);
        }
    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        return `(Build: ${releaseInfo.buildNumber.toString()}.${releaseInfo.backendSystemInfo.BuildNumber})`;
    }
}

module.exports = Component;
