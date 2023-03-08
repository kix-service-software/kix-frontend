/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { ContextType } from '../../../../../model/ContextType';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public contextId: string = null,
        public actions: AbstractAction[] = [],
        public editorActive: boolean = false,
        public value: string = null
    ) {
        super();
    }

}
