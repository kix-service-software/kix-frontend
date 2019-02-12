import { SearchResultCategory } from "./SearchResultCategory";

export interface IKIXObjectSearchListener {

    listenerId: string;

    searchCleared(): void;

    searchFinished(): void;

    searchResultCategoryChanged(category: SearchResultCategory): void;
}
