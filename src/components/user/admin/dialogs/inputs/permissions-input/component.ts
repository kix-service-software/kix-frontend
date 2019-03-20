import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../../../core/model";

class Component extends FormInputComponent<any[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.permissionManager.init();
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        return;
    }
}

module.exports = Component;
