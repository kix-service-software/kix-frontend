/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfigItem } from '../../../model/ConfigItem';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Version } from '../../../model/Version';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../../model/VersionProperty';
import { ConfigItemVersionLoadingOptions } from '../../../model/ConfigItemVersionLoadingOptions';
import { PreparedData } from '../../../model/PreparedData';
import { ConfigItemAttachment } from '../../../model/ConfigItemAttachment';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { LabelValueGroup } from '../../../../../model/LabelValueGroup';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { AttachmentLoadingOptions } from '../../../model/AttachmentLoadingOptions';
import { LabelValueGroupValue } from '../../../../../model/LabelValueGroupValue';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.version) {
            this.state.version = input.version;
            this.prepareVersion();
        } else if (input.configItem) {
            this.loadVersion(input.configItem);
        }
    }

    private async loadVersion(configItem: ConfigItem): Promise<void> {
        const versions = await KIXObjectService.loadObjects<Version>(
            KIXObjectType.CONFIG_ITEM_VERSION, configItem.CurrentVersion ? [configItem.CurrentVersion.VersionID] : null,
            new KIXObjectLoadingOptions(undefined, null, null, [VersionProperty.DATA, VersionProperty.PREPARED_DATA]),
            new ConfigItemVersionLoadingOptions(configItem.ConfigItemID)
        );

        if (versions && versions.length) {
            this.state.version = versions[versions.length - 1];
            this.prepareVersion();
        }
    }

    private async prepareVersion(): Promise<void> {
        if (this.state.version) {
            this.state.preparedData = await this.addStateData(this.state.version);
            this.state.preparedData = this.state.preparedData.concat(this.state.version.PreparedData);
            this.setVersion();
        }
    }

    private async setVersion(): Promise<void> {
        if (this.state.version && this.state.preparedData) {
            this.state.groups = await this.prepareLabelValueGroups(this.state.preparedData);
        }
    }

    private async addStateData(version: Version): Promise<PreparedData[]> {
        const preparedDataArray: PreparedData[] = [];

        const inciStateHash = new PreparedData();
        inciStateHash.Key = version.InciState;
        inciStateHash.Label = version.isCurrentVersion
            ? 'Translatable#Current Incident state'
            : 'Translatable#Incident state';
        inciStateHash.DisplayValue = version.isCurrentVersion
            ? version.CurInciState
            : version.InciState;
        preparedDataArray.push(inciStateHash);

        const deplStateHash = new PreparedData();
        deplStateHash.Key = version.DeplState;
        deplStateHash.Label = version.isCurrentVersion
            ? 'Translatable#Current deployment state'
            : 'Translatable#Deployment state';
        deplStateHash.DisplayValue = version.isCurrentVersion
            ? version.CurDeplState
            : version.DeplState;

        preparedDataArray.push(deplStateHash);

        return preparedDataArray;
    }

    public async fileClicked(attachment: ConfigItemAttachment): Promise<void> {
        if (this.state.version) {
            const attachments = await KIXObjectService.loadObjects<ConfigItemAttachment>(
                KIXObjectType.CONFIG_ITEM_ATTACHMENT, [attachment.ID], undefined,
                new AttachmentLoadingOptions(this.state.version.ConfigItemID, this.state.version.VersionID)
            );

            if (attachments && attachments.length) {
                BrowserUtil.startBrowserDownload(
                    attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
                );
            }
        }
    }

    private async prepareLabelValueGroups(data: PreparedData[]): Promise<LabelValueGroup[]> {
        const groups = [];

        let attachment: ConfigItemAttachment;
        let multiline: boolean;

        for (const attr of data) {
            let value = await TranslationService.translate(attr.DisplayValue);
            if (attr.Type === 'Date') {
                value = await DateTimeUtil.getLocalDateString(value);
            } else if (attr.Type === 'Attachment' && attr.Value) {
                value = attr.Value.Filename;
                attachment = attr.Type === 'Attachment'
                    ? new ConfigItemAttachment(attr.Value)
                    : null;
            } else if (attr.Type === 'TextArea') {
                multiline = true;
            }

            const subAttributes = (attr.Sub && attr.Sub.length ? await this.prepareLabelValueGroups(attr.Sub) : null);

            const label = await TranslationService.translate(attr.Label);
            groups.push(
                new LabelValueGroup(
                    label, new LabelValueGroupValue(value, multiline, attachment), null, null, subAttributes
                )
            );
        }
        return groups;
    }

}

module.exports = Component;
