import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, Customer } from "../../model";

export class CustomerFormService extends KIXObjectFormService<Customer> {

    private static INSTANCE: CustomerFormService;

    public static getInstance(): CustomerFormService {
        if (!CustomerFormService.INSTANCE) {
            CustomerFormService.INSTANCE = new CustomerFormService();
        }
        return CustomerFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CUSTOMER;
    }

}
