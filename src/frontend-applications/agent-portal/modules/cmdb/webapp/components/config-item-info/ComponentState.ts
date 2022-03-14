/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItem } from '../../../model/ConfigItem';

import { ConfigItemLabelProvider } from '../../core';

export class ComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public loading: boolean = true,
        public labelProvider: ConfigItemLabelProvider = new ConfigItemLabelProvider()
    ) { }

}
