import { KIXCommunicator } from './KIXCommunicator';
import { ApplicationEvent, LoadComponentsRequest, LoadComponentsResponse } from '@kix/core/dist/model';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class ApplicationCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'application';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler<LoadComponentsRequest, LoadComponentsResponse>(
            client, ApplicationEvent.LOAD_COMPONENTS, this.loadComponents.bind(this)
        );
    }

    private async loadComponents(data: LoadComponentsRequest): Promise<CommunicatorResponse<LoadComponentsResponse>> {
        const tags = await this.markoService.getComponentTags();
        const response = new LoadComponentsResponse(data.requestId, tags);
        return new CommunicatorResponse(ApplicationEvent.COMPONENTS_LOADED, response);
    }
}
