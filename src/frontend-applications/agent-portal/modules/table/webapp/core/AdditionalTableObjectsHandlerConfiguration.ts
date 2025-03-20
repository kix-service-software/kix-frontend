/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';

export class AdditionalTableObjectsHandlerConfiguration implements IConfiguration {

    public type;

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public id: string,
        public name: string,
        public handlerId: string,
        public handlerConfiguration?: any,
        public dependencyProperties: string[] = [],
        public valid: boolean = true,
    ) {
        this.type = ConfigurationType.AdditionalTableObjectsHandler;
    }

}
