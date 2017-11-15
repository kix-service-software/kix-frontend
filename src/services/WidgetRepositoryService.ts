import { injectable, inject } from 'inversify';

import {
    IPluginService,
    IConfigurationService
} from '@kix/core';

@injectable()
export class WidgetRepositoryService {

    public constructor( @inject("IConfigurationService") configurationService: IConfigurationService, @inject("IPluginService") pluginService: IPluginService) {
        // const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();

    }
}