/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FieldLayout } from './FieldLayout';
import { FormLayoutFontSize } from './FormLayoutFontSize';
import { GroupLayout } from './GroupLayout';
import { RowLayout } from './RowLayout';

export class FormLayout {

    public constructor(
        public groupLayout: GroupLayout[] = [],
        public rowLayout: RowLayout[] = [],
        public fields: FieldLayout[] = [],
        public fontSize: FormLayoutFontSize = FormLayoutFontSize.SMALL
    ) { }

}