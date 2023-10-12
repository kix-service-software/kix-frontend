/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class ArticleColorsConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'article-colors-configuration';

    public id: string = ArticleColorsConfiguration.CONFIGURATION_ID;
    public name: string = 'Define colors (CSS) for article channels, such as "note" or "email".';
    public type: string = 'ArticleColorsConfiguration';
    public valid: boolean = true;

    public application: string = 'agent-portal';

    public constructor(
        public note: string = '#fbf7e2',
        public email: string = '#e1eaeb'
    ) { }

}