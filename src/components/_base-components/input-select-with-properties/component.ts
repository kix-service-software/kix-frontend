import { SelectWithPropertiesComponentState } from "./model/SelectWithPropertiesComponentState";

class SelectWithProperties {

    private state: SelectWithPropertiesComponentState;

    public onCreate(input: any): void {
        this.state = new SelectWithPropertiesComponentState(
            input.list,
            input.properties
        );
    }

    public onInput(input: any): void {
        this.state.list = input.list;
        this.state.properties = input.properties;
        (this as any).setStateDirty();
    }

    private selectElement(id, event: any): void {
        this.state.list.forEach((le) => {
            if (le.id === id) {
                le.selected = true;
            } else {
                le.selected = false;
            }
        });
        (this as any).setStateDirty('list');
    }

    private checkboxToggle(elementId: string, propertyId: string, event: any): void {
        event.stopPropagation();
        const element = this.state.list.find((le) => le.id === elementId);
        if (element) {
            const property = this.state.properties.find((lp) => lp.id === propertyId);
            element.properties[propertyId] = !element.properties[propertyId];
            (this as any).setStateDirty("list");
        }
    }

    private radioToggle(elementId: string, propertyId: string, propValue: any, event: any): void {
        event.stopPropagation();
        const element = this.state.list.find((le) => le.id === elementId);
        if (element) {
            const property = this.state.properties.find((lp) => lp.id === propertyId);
            element.properties[propertyId] = propValue;
            (this as any).setStateDirty("list");
        }
    }
}

module.exports = SelectWithProperties;
