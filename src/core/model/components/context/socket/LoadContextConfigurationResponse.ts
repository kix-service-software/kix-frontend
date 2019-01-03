import { ContextConfiguration } from '../..';

export class LoadContextConfigurationResponse<T extends ContextConfiguration> {

    public constructor(
        public contextConfiguration: T
    ) { }
}
