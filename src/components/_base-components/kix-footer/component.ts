import { ComponentState } from './ComponentState';
import { ReleaseInfo } from '../../../core/model';
import { ObjectDataService } from '../../../core/browser/ObjectDataService';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.releaseInfo = input.releaseInfo;
    }

    public async onMount(): Promise<void> {
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData && objectData.currentUser) {
            this.state.currentUserLogin = objectData.currentUser.UserLogin;
        }

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
        const backendBuildNumber = releaseInfo.backendSystemInfo ? releaseInfo.backendSystemInfo.BuildNumber : '';
        return `(Build: ${releaseInfo.buildNumber.toString()}.${backendBuildNumber})`;
    }
}

module.exports = Component;
