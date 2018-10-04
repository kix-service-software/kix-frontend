import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser';
import { ReleaseInfo } from '@kix/core/dist/model';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.releaseInfo = input.releaseInfo;
    }

    public async onMount(): Promise<void> {
        if (!this.state.releaseInfo) {
            const objectData = ContextService.getInstance().getObjectData();
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
