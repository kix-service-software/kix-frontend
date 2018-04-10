import { VersionComponentState } from './VersionComponentState';
import { ContextService } from '@kix/core/dist/browser/context';

export class VersionComponent {

    private state: VersionComponentState;

    public onCreate(): void {
        this.state = new VersionComponentState();
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.kixVersion = objectData.kixVersion;
        this.state.kixProduct = objectData.kixProduct;
    }

}

module.exports = VersionComponent;
