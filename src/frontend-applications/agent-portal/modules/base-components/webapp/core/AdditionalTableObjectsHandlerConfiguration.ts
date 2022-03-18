/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public constructor(
        public id: string,
        public name: string,
        public handlerId: string,
        public handlerConfiguration?: any,
        public dependencyProperties: string[] = [],
    ) {
        this.type = ConfigurationType.AdditionalTableObjectsHandler;
    }

}
