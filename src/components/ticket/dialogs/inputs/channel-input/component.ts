import { ComponentState } from './ComponentState';
import { FormInputComponent, Channel, KIXObjectType, ChannelProperty, ObjectIcon } from '../../../../../core/model';
import {
    KIXObjectService, LabelService, ILabelProvider, FormService, ServiceRegistry, ServiceType
} from '../../../../../core/browser';
import { TicketFormService } from '../../../../../core/browser/ticket';

class Component extends FormInputComponent<number, ComponentState> {

    private labelProvider: ILabelProvider<Channel>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CHANNEL);
        this.state.channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
        if (this.state.channels) {

            for (const channel of this.state.channels) {
                const name = await this.labelProvider.getDisplayText(channel, ChannelProperty.NAME);
                this.state.channelNames.push([channel.ID, name]);
            }

            if (this.state.channels.length) {
                await this.channelClicked(this.state.channels[0]);
            }
        }
    }

    public getIcon(channel: Channel): string | ObjectIcon {
        if (this.labelProvider) {
            return this.labelProvider.getObjectIcon(channel);
        }
        return null;
    }

    public getDisplayText(channel: Channel): string {
        if (this.state.channelNames) {
            const name = this.state.channelNames.find((dt) => dt[0] === channel.ID);
            return name ? name[1] : channel.Name;
        }
        return null;
    }

    public isActive(channel: Channel): boolean {
        return channel.ID === this.state.currentChannel.ID;
    }

    public async channelClicked(channel: Channel): Promise<void> {
        this.state.currentChannel = channel;

        const formService = ServiceRegistry.getServiceInstance<TicketFormService>(
            KIXObjectType.TICKET, ServiceType.FORM
        );

        const channelFields = formService.getFormFieldsForChannel(this.state.currentChannel);

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.addNewFormField(this.state.field, channelFields, true);

        super.provideValue(this.state.currentChannel.ID);
    }

}

module.exports = Component;
