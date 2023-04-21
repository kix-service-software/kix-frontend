/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { IdService } from '../../../../../model/IdService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public type: OverlayType = null,
        public content: ComponentContent<any> = null,
        public icon: string | ObjectIcon = null,
        public title: string = null,
        public actions: AbstractAction[] = null,
        public hasCloseButton: boolean = false,
        public show: boolean = false,
        public overlayClass: string = null,
        public overlayInstanceId: string = 'overlay-widget',
        public overlayId: string = IdService.generateDateBasedId(),
    ) {
        super();
    }

}
