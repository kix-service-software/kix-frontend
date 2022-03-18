/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public widgets: ConfiguredWidget[] = null,
        public customizable: boolean = false,
        public configurationMode: boolean = false,
        public dragOverInstanceId: string = null,
        public searchBookmarkTreeId: string = null,
        public contextTreeId: string = null
    ) {
        super();
    }

}
