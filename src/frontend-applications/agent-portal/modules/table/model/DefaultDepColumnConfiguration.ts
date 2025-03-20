/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultColumnConfiguration } from '../../../model/configuration/DefaultColumnConfiguration';

export class DefaultDepColumnConfiguration extends DefaultColumnConfiguration {

    public constructor(
        configuration: DefaultColumnConfiguration,
        public dep: string,
    ) {
        super(
            configuration.id,
            configuration.name,
            configuration.type,
            configuration.property,
            configuration.showText,
            configuration.showIcon,
            configuration.showColumnTitle,
            configuration.showColumnIcon,
            configuration.size,
            configuration.sortable,
            configuration.filterable,
            configuration.hasListFilter,
            configuration.dataType,
            configuration.resizable,
            configuration.componentId,
            configuration.defaultText,
            configuration.translatable,
            configuration.titleTranslatable,
            configuration.useObjectServiceForFilter,
            configuration.valid,
        );
    }

}
