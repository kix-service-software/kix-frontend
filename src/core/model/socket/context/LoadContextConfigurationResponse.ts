import { ContextConfiguration } from '../..';
import { ISocketResponse } from '../ISocketResponse';

export class LoadContextConfigurationResponse<T extends ContextConfiguration> implements ISocketResponse {

    public constructor(
        public requestId: string,
        public contextConfiguration: T
    ) { }
}
