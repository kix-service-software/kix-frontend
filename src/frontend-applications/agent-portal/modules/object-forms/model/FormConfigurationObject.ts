/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../model/configuration/ConfigurationType';

export class FormConfigurationObject {

    public constructor(
        public configurationType?: ConfigurationType | string,
        public pageId?: string,
        public groupId?: string,
        public fieldId?: string,
        public fieldProperty?: string
    ) { }

}