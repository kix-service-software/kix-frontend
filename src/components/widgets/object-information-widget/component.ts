import { ComponentState } from './ComponentState';
import { ContextService, LabelService, ActionFactory, IdService } from '../../../core/browser';
import { KIXObjectType, KIXObject, ObjectinformationWidgetSettings } from '../../../core/model';
import { ComponentInput } from './ComponentInput';

class Component {

    private state: ComponentState;

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const settings: ObjectinformationWidgetSettings = this.state.widgetConfiguration.settings;
        if (settings) {
            this.state.properties = settings.properties;
            this.state.flat = settings.displayFlatList;
            this.state.routingConfigurations = settings.routingConfigurations;
        }

        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        context.registerListener(this.contextListenerId, {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (contactId: string, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(settings);
            }
        });

        await this.initWidget(settings);
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(settings: ObjectinformationWidgetSettings): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const object = await context.getObject(settings.objectType);
        this.state.object = null;

        setTimeout(() => {
            this.state.object = object;
            this.prepareActions();
        }, 10);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.object) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.object]
            );
        }
    }

}

module.exports = Component;
