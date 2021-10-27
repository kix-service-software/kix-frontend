/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from '../../../../../modules/base-components/webapp/core/ILabelProvider';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentInput {

    public object: any;

    public displayIcon: ObjectIcon | string;

    public propertyText: string;

    public displayText: string;

    public property: string;

    public labelProvider: ILabelProvider;

    public info: any;

    public routingConfiguration: RoutingConfiguration;

    public showIcon: boolean;

    public showText: boolean;

    public showLabel: boolean;

}
