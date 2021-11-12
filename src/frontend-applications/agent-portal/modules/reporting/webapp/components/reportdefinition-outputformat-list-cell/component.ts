/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Label } from '../../../../base-components/webapp/core/Label';
import { ReportingContext } from '../../core/context/ReportingContext';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { ReportOutputFormat } from '../../../model/ReportOutputFormat';
import { ReportObjectCreator } from '../../core/form/ReportObjectCreator';
import { ReportService } from '../../core/ReportService';
import { ReportDefinitionDialogUtil } from '../../core/ReportDefinitionDialogUtil';
import { ValidObject } from '../../../../valid/model/ValidObject';

class Component extends AbstractMarkoComponent<ComponentState> {

    private definition: ReportDefinition;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.definition = input.cell.getRow().getRowObject().getObject();
        this.updateCell();
    }

    private async updateCell(): Promise<void> {
        const labels: Label[] = [];
        const outputFormatsConfig = this.definition.Config['OutputFormats'];
        if (outputFormatsConfig) {
            for (const of in outputFormatsConfig) {
                if (!outputFormatsConfig[of]) {
                    continue;
                }

                if (this.definition.BaseURL) {
                    const url = this.definition.BaseURL + of;

                    labels.push(new Label(null, of, null, of, null, url, false, null,
                        {
                            title: of,
                            content: 'output-format-info',
                            instanceId: 'output-format-info',
                            data: {
                                data: {
                                    Name: of,
                                    URL: url
                                }
                            },
                            large: true
                        }
                    ));
                }
                else {
                    labels.push(new Label(null, of, null, of, null));
                }
            }
        }

        if (!labels.length) {
            const formats = await KIXObjectService.loadObjects<ReportOutputFormat>(KIXObjectType.REPORT_OUTPUT_FORMAT);
            if (Array.isArray(formats) && formats.length) {
                formats.forEach((f) => {
                    if (this.definition.BaseURL) {
                        const url = this.definition.BaseURL + f.Name;
                        labels.push(new Label(null, f.Name, null, f.DisplayName, null, url, false, null,
                            {
                                title: f.Name,
                                content: 'output-format-info',
                                instanceId: 'output-format-info',
                                data: {
                                    data: {
                                        Name: f.Name,
                                        URL: url
                                    }
                                },
                                large: true
                            }
                        ));
                    }
                    else {
                        labels.push(new Label(null, f.Name, null, f.DisplayName));
                    }
                });
            }
        }

        this.state.cellLabels = SortUtil.sortObjects(labels, 'text', DataType.STRING);
    }

    public async labelClicked(label: Label, event: any): Promise<void> {

        const dialogNeeded = await ReportService.getInstance().hasRequiredParamatersWithoutDefaults(this.definition);

        // do nothing if definition is invalid
        if (this.definition.ValidID !== ValidObject.VALID) {
            return;
        }

        if (dialogNeeded) {
            ReportDefinitionDialogUtil.openCreateReportDialog(this.definition, label?.id?.toString());
        } else {
            const question = await TranslationService.translate(
                'Translatable#Create the report with output format {0} and defaults?', [label.text]
            );
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(
                    question,
                    this.createReport.bind(this, label),
                    () => ReportDefinitionDialogUtil.openCreateReportDialog(this.definition)
                )
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM, null, content, 'Translatable#Create', null, false
            );
        }

    }

    private async createReport(label: Label): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as ReportingContext;
        if (context && this.definition) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Creating Report' }
            );

            const report = await ReportObjectCreator.createReportObject(null, this.definition);
            report.Config['OutputFormats'] = [label.text];
            await KIXObjectService.createObject(KIXObjectType.REPORT, [[KIXObjectType.REPORT, report]])
                .catch((error: Error) => {
                    console.error(error);
                    const content = new StringContent(
                        'Translatable#An error occured during report creation. See system log for details.'
                    );

                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                    );
                });

            await context.reloadObjectList(KIXObjectType.REPORT_DEFINITION);

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        }
    }
}

module.exports = Component;
