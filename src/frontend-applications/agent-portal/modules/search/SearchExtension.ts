/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export abstract class SearchExtension extends KIXExtension implements IConfigurationExtension {

    public abstract getModuleId(): string;

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        // explorer
        const searchResultExplorer = new WidgetConfiguration(
            'search-dashboard-result-explorer-' + this.getModuleId(), 'Search Explorer', ConfigurationType.Widget,
            'search-result-explorer', 'Translatable#Search Results', [], null, null,
            false, true, 'kix-icon-search', false
        );
        configurations.push(searchResultExplorer);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Search', ConfigurationType.Context,
                this.getModuleId(),
                [],
                [
                    new ConfiguredWidget(
                        'search-dashboard-result-explorer-' + this.getModuleId(),
                        'search-dashboard-result-explorer-' + this.getModuleId()
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}
