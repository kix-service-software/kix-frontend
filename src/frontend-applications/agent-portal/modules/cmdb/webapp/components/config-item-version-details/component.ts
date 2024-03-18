/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { PreparedData } from '../../../model/PreparedData';
import { ConfigItemAttachment } from '../../../model/ConfigItemAttachment';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { LabelValueGroup } from '../../../../../model/LabelValueGroup';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { AttachmentLoadingOptions } from '../../../model/AttachmentLoadingOptions';
import { DisplayImageDescription } from '../../../../base-components/webapp/core/DisplayImageDescription';
import { LabelValueGroupValue } from '../../../../../model/LabelValueGroupValue';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ImageViewerEvent } from '../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../agent-portal/model/ImageViewerEventData';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { OrganisationDetailsContext } from '../../../../customer/webapp/core/context/OrganisationDetailsContext';
import { ContactDetailsContext } from '../../../../customer/webapp/core/context/ContactDetailsContext';
import { ConfigItemDetailsContext } from '../../core';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';

class Component {

    private state: ComponentState;
    private imagesByGroup: Array<number[]> = [];

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
        if (!configItem.CurrentVersion) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [
                ConfigItemProperty.CURRENT_VERSION,
                VersionProperty.DATA, VersionProperty.PREPARED_DATA
            ];
            const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, [configItem.ConfigItemID], loadingOptions
            ).catch((): ConfigItem[] => []);

            if (configItems.length) {
                configItem = configItems[0];
            }
        }

        if (configItem.CurrentVersion) {
            this.state.version = configItem.CurrentVersion;
            this.prepareVersion();
        }
    }

    private async prepareVersion(): Promise<void> {
        if (this.state.version) {
            this.state.preparedData = await this.addCommonData(this.state.version);
            this.state.preparedData = this.state.preparedData.concat(this.state.version.PreparedData);
            this.setVersion();
        }
    }

    private async setVersion(): Promise<void> {
        if (this.state.version && this.state.preparedData) {
            this.imagesByGroup = [];
            this.state.groups = await this.prepareLabelValueGroups(this.state.preparedData);
        }
    }

    private async addCommonData(version: Version): Promise<PreparedData[]> {
        const preparedDataArray: PreparedData[] = [];

        const nameHash = new PreparedData();
        nameHash.Key = 'VersionName';
        nameHash.Label = 'Translatable#Name';
        nameHash.DisplayValue = version.Name;

        preparedDataArray.push(nameHash);

        const deplStateHash = new PreparedData();
        deplStateHash.Key = version.DeplState;
        deplStateHash.Label = version.IsLastVersion
            ? 'Translatable#Current deployment state'
            : 'Translatable#Deployment state';
        deplStateHash.DisplayValue = version.IsLastVersion
            ? version.CurDeplState
            : version.DeplState;

        preparedDataArray.push(deplStateHash);

        return preparedDataArray;
    }

    public async fileClicked(attachment: ConfigItemAttachment, force: boolean): Promise<void> {
        if (this.state.version) {
            let images: DisplayImageDescription[] = [];
            if (attachment.ContentType.match(/^image\//)) {
                images = await this.getImages(attachment.ID);
            }

            if (!force && images.length && images.some((i) => i.imageId === attachment.ID)) {
                EventService.getInstance().publish(
                    ImageViewerEvent.OPEN_VIEWER,
                    new ImageViewerEventData(images, attachment.ID)
                );
            } else {
                const attachments = await KIXObjectService.loadObjects<ConfigItemAttachment>(
                    KIXObjectType.CONFIG_ITEM_ATTACHMENT, [attachment.ID], undefined,
                    new AttachmentLoadingOptions(this.state.version.ConfigItemID, this.state.version.VersionID)
                );

                if (attachments && attachments.length) {
                    if (!force && attachments[0].ContentType === 'application/pdf') {
                        BrowserUtil.openPDF(attachments[0].Content, attachments[0].Filename);
                    } else {
                        BrowserUtil.startBrowserDownload(
                            attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
                        );
                    }
                }
            }
        }
    }

    private async getImages(attachmentId: number): Promise<DisplayImageDescription[]> {
        let displayImages: DisplayImageDescription[] = [];
        if (Array.isArray(this.imagesByGroup)) {
            for (const imageIds of this.imagesByGroup) {
                if (imageIds.some((iId) => iId === attachmentId)) {
                    displayImages = await this.loadImages(imageIds);
                    break;
                }
            }
        }
        return displayImages;
    }

    private async loadImages(imageIds: number[]): Promise<DisplayImageDescription[]> {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        for (const id of imageIds) {
            attachmentPromises.push(new Promise<DisplayImageDescription>(async (resolve, reject) => {
                const imagesAttachments = await KIXObjectService.loadObjects<ConfigItemAttachment>(
                    KIXObjectType.CONFIG_ITEM_ATTACHMENT, [id], undefined,
                    new AttachmentLoadingOptions(
                        this.state.version.ConfigItemID,
                        this.state.version.VersionID
                    )
                ).catch(() => null);

                if (imagesAttachments) {
                    const content = `data:${imagesAttachments[0].ContentType};base64,${imagesAttachments[0].Content}`;
                    resolve(new DisplayImageDescription(
                        id, content,
                        imagesAttachments[0].Comment ? imagesAttachments[0].Comment : imagesAttachments[0].Filename
                    ));
                } else {
                    resolve(null);
                }
            }));
        }
        return (await Promise.all(attachmentPromises)).filter((i) => i);
    }

    private async prepareLabelValueGroups(data: PreparedData[]): Promise<LabelValueGroup[]> {
        const groups = [];
        const images: number[] = [];

        for (const attr of data) {
            let attachment: ConfigItemAttachment;
            let multiline: boolean;
            let routingConfiguration: RoutingConfiguration;

            let value = await TranslationService.translate(attr.DisplayValue);
            if (attr.Type === 'Date') {
                value = await DateTimeUtil.getLocalDateString(value);
            } else if (attr.Type === 'DateTime') {
                value = await DateTimeUtil.getLocalDateTimeString(value);
            } else if (attr.Type === 'Attachment' && attr.Value) {
                value = attr.Value.Filename;

                if (attr.Value.ContentType.match(/^image\//)) {
                    images.push(Number(attr.Value.ID || attr.Value.AttachmentID));
                }
                attachment = new ConfigItemAttachment(attr.Value);
            } else if (attr.Type === 'TextArea') {
                multiline = true;
            } else if (attr.Type === KIXObjectType.ORGANISATION && attr.Value) {
                routingConfiguration = new RoutingConfiguration(
                    OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION
                );
                routingConfiguration.replaceObjectId = attr.Value;
            } else if (attr.Type === KIXObjectType.CONTACT && attr.Value) {
                routingConfiguration = new RoutingConfiguration(
                    ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT
                );
                routingConfiguration.replaceObjectId = attr.Value;
            } else if (attr.Type === 'CIClassReference' && attr.Value) {
                routingConfiguration = new RoutingConfiguration(
                    ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM
                );
                routingConfiguration.replaceObjectId = attr.Value;
            }

            const subAttributes = (attr.Sub && attr.Sub.length ? await this.prepareLabelValueGroups(attr.Sub) : null);

            const label = await TranslationService.translate(attr.Label);
            const labelValueGroup = new LabelValueGroupValue(value, multiline, attachment, routingConfiguration);
            const group = new LabelValueGroup(
                label, labelValueGroup, null, null, subAttributes
            );
            groups.push(group);
        }

        if (images.length) {
            this.imagesByGroup.push(images);
        }

        return groups;
    }

}

module.exports = Component;
