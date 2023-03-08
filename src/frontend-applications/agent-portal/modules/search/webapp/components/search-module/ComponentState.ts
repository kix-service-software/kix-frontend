/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentState extends AbstractComponentState {
    public constructor(
        public componentKey: string = IdService.generateDateBasedId(),
        public instanceId: string = null,
        public title: string = '',
        public icon: string | ObjectIcon = null,
        public configuration: WidgetConfiguration = null,
        public objectType: KIXObjectType | string = null,
        public prepared: boolean = false
    ) {
        super();
    }
}
