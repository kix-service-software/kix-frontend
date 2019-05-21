import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, LabelService } from '../../../core/browser';
import { ComponentInput } from './ComponentInput';
import { KIXObject } from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
class Component extends AbstractMarkoComponent<ComponentState> {

    private routingConfiguration: RoutingConfiguration;

    private navigationProperties: string[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.properties = input.properties;
        this.routingConfiguration = input.routingConfiguration;
        this.navigationProperties = input.navigationProperties;
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
        if (this.navigationProperties && this.navigationProperties.some((np) => np === property)) {
            return this.routingConfiguration;
        }
    }
}

module.exports = Component;
