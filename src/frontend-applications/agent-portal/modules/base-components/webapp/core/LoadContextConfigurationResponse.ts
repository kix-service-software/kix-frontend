/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketResponse } from './ISocketResponse';
import { ContextConfiguration } from '../../../../model/configuration/ContextConfiguration';

export class LoadContextConfigurationResponse<T extends ContextConfiguration> implements ISocketResponse {

    public constructor(
        public requestId: string,
        public contextConfiguration: T
    ) { }
}
