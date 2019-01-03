import { ComponentState } from './ComponentState';
import { TicketListContext } from '../../../core/browser/ticket';
import { ContextService } from '../../../core/browser';
import { ReleaseInfo } from '../../../core/model';

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
            this.state.kixVersion = `${releaseInfo.product} ${releaseInfo.version} ${this.getBuildNumber(releaseInfo)}`;
        }
    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        return `[Build: ${releaseInfo.buildNumber.toString()}.${releaseInfo.backendSystemInfo.BuildNumber}]`;
    }

}

module.exports = Component;
