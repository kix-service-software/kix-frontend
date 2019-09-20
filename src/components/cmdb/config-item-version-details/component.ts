/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    Version, KIXObjectType, ConfigItemAttachment, DateTimeUtil, LabelValueGroup,
    KIXObjectLoadingOptions, ArticleLoadingOptions, ConfigItemProperty, VersionProperty, ConfigItem
} from '../../../core/model';
import { BrowserUtil, KIXObjectService } from '../../../core/browser';
import { PreparedData } from '../../../core/model/kix/cmdb/PreparedData';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ConfigItemVersionLoadingOptions } from '../../../core/model/kix/cmdb/ConfigItemVersionLoadingOptions';
import { TicketHistoryResponse } from '../../../core/api';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        if (input.version) {
            this.state.version = input.version;
            this.setVersion(this.state.version);
        } else if (input.configItem) {
            const ci = input.configItem as ConfigItem;
            if (ci.CurrentVersion) {
                const versions = await KIXObjectService.loadObjects<Version>(
                    KIXObjectType.CONFIG_ITEM_VERSION, null,
                    new KIXObjectLoadingOptions(null, null, 1, [VersionProperty.DATA, VersionProperty.PREPARED_DATA]),
                    new ConfigItemVersionLoadingOptions(ci.ConfigItemID)
                );

                if (versions && versions.length) {
                    this.state.version = versions[0];
                    this.setVersion(this.state.version);
                }
            }
        }
    }

    public async onMount(): Promise<void> {
        this.state.preparedData = await this.addStateData(this.state.version);
        this.state.preparedData = this.state.preparedData.concat(this.state.version.PreparedData);
        this.setVersion(this.state.version);
    }

    private async setVersion(version: Version): Promise<void> {
        if (this.state.version && this.state.preparedData) {
            this.state.groups = await this.prepareLabelValueGroups(this.state.preparedData);
        }
    }

    private async addStateData(version: Version): Promise<PreparedData[]> {
        const preparedDataArray: PreparedData[] = [];

        const curInciStateHash = new PreparedData();
        curInciStateHash.Key = version.CurInciState;
        curInciStateHash.Label = "Translatable#Current incident state";
        curInciStateHash.DisplayValue = version.CurInciState;

        const curDeplStateHash = new PreparedData();
        curDeplStateHash.Key = version.CurDeplState;
        curDeplStateHash.Label = "Translatable#Current deployment state";
        curDeplStateHash.DisplayValue = version.CurDeplState;

        preparedDataArray.push(curInciStateHash);
        preparedDataArray.push(curDeplStateHash);

        return preparedDataArray;
    }

    public async fileClicked(attachment: ConfigItemAttachment): Promise<void> {
        const attachments = await KIXObjectService.loadObjects<ConfigItemAttachment>(
            KIXObjectType.CONFIG_ITEM_ATTACHMENT, [attachment.ID]
        );

        if (attachments && attachments.length) {
            BrowserUtil.startBrowserDownload(
                attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
            );
        }
    }

    private async prepareLabelValueGroups(data: PreparedData[]): Promise<LabelValueGroup[]> {
        const groups = [];
        for (const attr of data) {
            let value = await TranslationService.translate(attr.DisplayValue);
            if (attr.Type === 'Date') {
                value = await DateTimeUtil.getLocalDateString(value);
            } else if (attr.Type === 'Attachment' && attr.Value) {
                value = attr.Value.Filename;
            }

            const subAttributes = (attr.Sub && attr.Sub.length ? await this.prepareLabelValueGroups(attr.Sub) : null);

            const label = await TranslationService.translate(attr.Label);
            groups.push(new LabelValueGroup(
                label, value, null, null, subAttributes,
                (attr.Type === 'Attachment' ? new ConfigItemAttachment(attr.Value) : null)
            ));
        }
        return groups;
    }

}

module.exports = Component;
