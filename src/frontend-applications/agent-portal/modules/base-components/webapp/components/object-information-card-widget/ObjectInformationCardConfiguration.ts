/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { AbstractConfiguration } from '../../../../../model/configuration/AbstractConfiguration';

export class ObjectInformationCardConfiguration extends AbstractConfiguration {

    public constructor(
        public avatar: ObjectIcon | string | Array<ObjectIcon | string>,
        public rows: InformationRowConfiguration[] = []
    ) {
        super();
    }

}

// tslint:disable-next-line:max-classes-per-file
export class InformationRowConfiguration {

    public constructor(
        public values?: Array<InformationConfiguration[]>,
        public title?: string,
        public style?: string,
        public separator?: boolean
    ) { }

}

// tslint:disable-next-line:max-classes-per-file
export class InformationConfiguration {

    public constructor(
        public componentId?: string,
        public componentData?: any,
        public conditions?: UIFilterCriterion[],
        public icon?: ObjectIcon | string,
        public iconStyle?: string,
        public text?: string,
        public textPlaceholder?: string[],
        public textStyle?: string,
        public linkSrc?: string,
        public routingConfiguration?: RoutingConfiguration,
        public routingObjectId?: string,
        public preparedText?: string,
        public preparedLinkSrc?: string
    ) { }

}

