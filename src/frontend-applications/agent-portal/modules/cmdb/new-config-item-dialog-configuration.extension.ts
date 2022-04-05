/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewConfigItemDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [],
                [
                    new ConfiguredWidget(
                        'new-asset-class-chooser', null,
                        new WidgetConfiguration(
                            'new-asset-class-chooser-widget', 'Asset Class Chooser', ConfigurationType.Widget,
                            'asset-class-chooser', 'Translatable#Asset Classes', []
                        )
                    )
                ],
                [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-new-dialog-widget', null,
                        KIXObjectType.CONFIG_ITEM, ContextMode.CREATE, [],
                        new WidgetConfiguration(
                            'new-config-item-dialog', 'Dialog Widget', ConfigurationType.Widget,
                            'object-dialog-form-widget', 'Translatable#New Config Item',
                            [], null, null, false, false, 'kix-icon-new-ci'
                        )
                    )

                ], [], [], [], []
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
