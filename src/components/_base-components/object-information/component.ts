import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, LabelService } from '../../../core/browser';
import { ComponentInput } from './ComponentInput';
import { KIXObject } from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
class Component extends AbstractMarkoComponent<ComponentState> {

    private routingConfigurations: Array<[string, RoutingConfiguration]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.properties = input.properties;
        this.routingConfigurations = input.routingConfigurations;
        this.state.flat = input.flat;
        this.init(input.object);
    }

    private async init(object: KIXObject): Promise<void> {
        if (object) {
            this.state.labelProvider = LabelService.getInstance().getLabelProvider(object);
        }

        this.state.object = object;
    }

    public getRoutingConfiguration(property: string): RoutingConfiguration {
        if (this.routingConfigurations && !!this.routingConfigurations.length) {
            const config = this.routingConfigurations.find((rc) => rc[0] === property);
            return config ? config[1] : undefined;
        }
    }

    public getRoutingObjectId(property: string): string | number {
        const config = this.getRoutingConfiguration(property);
        let id: string | number;
        if (config) {
            if (config.replaceObjectId) {
                id = config.replaceObjectId;
            } else {
                id = this.state.object ? this.state.object[config.objectIdProperty] : undefined;
            }
        }

        return id;
    }
}

module.exports = Component;
