import type { PaginationMeta } from './PaginationMeta';

export interface Pagination<T> {
	data: T[];
	meta: PaginationMeta;
}
