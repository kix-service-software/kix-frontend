/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../../model/kix/KIXObject';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { InformationRowConfiguration } from '../object-information-card-widget/ObjectInformationCardConfiguration';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public avatar: Array<ObjectIcon | string> = [],
        public information: InformationRowConfiguration[] = [],
        public templates: any = {},
        public valuesReady: boolean = false,
        public object: KIXObject = null
    ) {
        super();
    }

}