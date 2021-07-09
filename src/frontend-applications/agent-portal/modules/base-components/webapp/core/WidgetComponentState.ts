/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from './AbstractComponentState';
import { WidgetConfiguration } from '../../../../model/configuration/WidgetConfiguration';
import { ContextType } from '../../../../model/ContextType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export abstract class WidgetComponentState extends AbstractComponentState {

    public constructor(
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public showConfiguration: boolean = false,
        public error: string = null,
        public instanceId: string = null,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public closable: boolean = false,
        public icon: string | ObjectIcon = null
    ) {
        super();
    }

}
