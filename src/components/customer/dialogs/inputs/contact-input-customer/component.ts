import { ComponentState } from "./ComponentState";
import { FormDropdownItem, FormInputComponent, Customer, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { CustomerService } from "@kix/core/dist/browser/customer";
import { FormService } from "@kix/core/dist/browser/form";
import { ContextService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<Customer, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.state.searchCallback = this.searchCustomers.bind(this);
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        return;
    }

    private customerChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? item.object : null);
    }

    private async searchCustomers(limit: number, searchValue: string): Promise<FormDropdownItem[]> {
        this.state.customers = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, null, ContextMode.DASHBOARD, null, null, null, searchValue, limit
        );

        let items = [];
        if (searchValue && searchValue !== '') {
            items = this.state.customers.map(
                (c) => new FormDropdownItem(c.CustomerID, 'kix-icon-man-house', c.DisplayValue, null, c)
            );
        }

        return items;
    }

}

module.exports = Component;
