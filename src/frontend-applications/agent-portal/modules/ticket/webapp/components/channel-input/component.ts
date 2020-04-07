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
            "Translatable#No Article"
        ]);

        let channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
        channels = channels.filter((c) => c.ValidID.toString() === "1");

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

        this.setCurrentChannel();

        if (this.state.noChannel && !this.state.currentChannel) {
            super.provideValue(null);
        } else if (!this.state.noChannel && !this.state.currentChannel && this.state.channels.length) {
            this.state.currentChannel = this.state.channels[0];
            super.provideValue(this.state.currentChannel.ID);
        }

        this.setFields();
    }

    public setCurrentChannel(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const channel = this.state.channels.find((ch) => ch.ID === this.state.defaultValue.value);
            this.channelClicked(channel);
        } else if (this.state.channels.length === 1) {
            this.channelClicked(this.state.channels[0]);
        }
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
        if (!this.isActive(channel)) {
            this.state.currentChannel = channel;
            super.provideValue(this.state.currentChannel ? this.state.currentChannel.ID : null);
            this.setFields(true);
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
            formInstance.addNewFormField(this.state.field, channelFields, true);
        } else {
            formInstance.addNewFormField(this.state.field, [], true);
        }
    }

}

module.exports = Component;
