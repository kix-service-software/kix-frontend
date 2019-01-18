import { KIXObjectPropertyFilter } from "../../../model";

export interface ITableFilterLayer {

    filter(value: string, filter?: KIXObjectPropertyFilter): void;

    reset(): void;

}
