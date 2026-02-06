export interface SearchMetadata {
  count: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

export interface SearchRequest {
  sortBy: string;
  pageSize: number;
  pageNumber: number;
}

export interface SearchResponse<T> {
  data: T[];
  metadata: SearchMetadata;
}
