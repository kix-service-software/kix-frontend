/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { Channel } from '../../../model/Channel';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { isArray } from 'util';
import { ChannelProperty } from '../../../model/ChannelProperty';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ArticleFormService } from '../../core';
import { ServiceType } from '../../../../../modules/base-components/webapp/core/ServiceType';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#No Article'
        ]);
    }

    public async setCurrentValue(): Promise<void> {
        if (!this.state.channels) {
            await this.loadChannels();
        }

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<number>(this.state.field.instanceId);
        if (value && value.value) {
            let channelId = Number(value.value);
            if (Array.isArray(value.value)) {
                channelId = Number(value.value[0]);
            }
            if (!this.state.currentChannel || channelId !== this.state.currentChannel.ID) {
                const channel = this.state.channels.find((ch) => ch.ID === channelId);
                this.state.currentChannel = channel;
                this.setFields();
            }
        }
    }

    private async loadChannels(): Promise<void> {
        let channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
        channels = channels.filter((c) => c.ValidID.toString() === '1');

        const channelsOption = this.state.field.options.find((o) => o.option === 'CHANNELS');
        if (channelsOption && channelsOption.value && isArray(channelsOption.value) && channelsOption.value.length) {
            channelsOption.value.forEach((cid) => {
                const channel = channels.find((c) => c.ID === cid);
                if (channel) {
                    this.state.channels.push(channel);
                }
            });
        } else {
            this.state.channels = channels;
        }

        if (this.state.channels) {
            for (const channel of this.state.channels) {
                const name = await LabelService.getInstance().getDisplayText(channel, ChannelProperty.NAME);
                this.state.channelNames.push([channel.ID, name]);
            }
        }

        const noChannelOption = this.state.field.options.find((o) => o.option === 'NO_CHANNEL');
        if (noChannelOption) {
            this.state.noChannel = noChannelOption.value;
        }
        this.setFields();
    }

    public getIcon(channel: Channel): string | ObjectIcon {
        return LabelService.getInstance().getObjectIcon(channel);
    }

    public getDisplayText(channel: Channel): string {
        if (this.state.channelNames) {
            const name = this.state.channelNames.find((dt) => dt[0] === channel.ID);
            return name ? name[1] : channel.Name;
        }
        return null;
    }

    public isActive(channel: Channel): boolean {
        if (channel && this.state.currentChannel) {
            return channel.ID === this.state.currentChannel.ID;
        }
        return channel === this.state.currentChannel;
    }

    public async channelClicked(channel: Channel): Promise<void> {
        if (!this.state.field.readonly && !this.isActive(channel)) {
            this.state.currentChannel = channel;
            this.setFields();
            super.provideValue(this.state.currentChannel ? this.state.currentChannel.ID : null);
        }
    }

    private async setFields(clear?: boolean): Promise<void> {
        const formService = ServiceRegistry.getServiceInstance<ArticleFormService>(
            KIXObjectType.ARTICLE, ServiceType.FORM
        );
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

        if (this.state.currentChannel) {
            const channelFields = await formService.getFormFieldsForChannel(
                this.state.currentChannel, this.state.formId, clear
            );
            formInstance.addFieldChildren(this.state.field, channelFields, true);
        } else {
            formInstance.addFieldChildren(this.state.field, [], true);
        }
    }

}

module.exports = Component;
