import { ContextConfiguration } from '../..';
import { ISocketResponse } from '../../../socket';

export class LoadContextConfigurationResponse<T extends ContextConfiguration> implements ISocketResponse {

    public constructor(
        public requestId: string,
        public contextConfiguration: T
    ) { }
}
