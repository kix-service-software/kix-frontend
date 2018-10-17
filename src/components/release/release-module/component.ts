import { ComponentState } from './ComponentState';
import { TicketListContext } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser';
import { ReleaseInfo } from '@kix/core/dist/model';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const objectData = ContextService.getInstance().getObjectData();
        const releaseInfo = objectData.releaseInfo;

        if (releaseInfo) {
            // TODO:  build nummern mit Releasenummer ersetzen, wenn es eine geben sollte
            this.state.kixVersionString
                = `${releaseInfo.product} ${releaseInfo.version} ${this.getBuildNumber(releaseInfo)}`;
        }
    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        return `[${releaseInfo.buildNumber.toString()}.${releaseInfo.backendSystemInfo.BuildNumber}]`;
    }

}

module.exports = Component;
