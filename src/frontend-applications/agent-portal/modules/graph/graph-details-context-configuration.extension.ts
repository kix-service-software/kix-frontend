/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { GraphContext } from './webapp/core/GraphContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return GraphContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const graphExplorer = new WidgetConfiguration(
            'graph-explorer', 'Graph Explorer', ConfigurationType.Widget, 'graph-explorer',
            'Translatable#Graph Options', []
        );

        const graphWidget = new WidgetConfiguration(
            'graph-widget', 'Graph', ConfigurationType.Widget, 'graph-widget', 'Translatable#Graph',
            [], null, null, false, true, null, false
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [],
                [
                    new ConfiguredWidget('graph-explorer', null, graphExplorer)
                ], [],
                [
                    new ConfiguredWidget('graph-widget', null, graphWidget)
                ],
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
