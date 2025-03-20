/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFormFieldValue } from './DynamicFormFieldValue';
import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public dynamicValues: DynamicFormFieldValue[] = [],
        public options: ObjectPropertyValueOption[] = [],
        public hasAdditionalOptions: boolean = false,
        public additionalOptionsValidationResult: Map<string, string> = new Map(),
        public draggableValueId: string = null,
        public dragStartIndex: number = null,
        public invalid: boolean = false
    ) {
        super();
    }

}
