/**
 * CriteriaBuilder
 * 
 * Reusable builder for constructing backend-agnostic search requests.
 * Centralizes the payload structure for search endpoints.
 * Supports URL synchronization and serialization for Saved Views.
 */
export class CriteriaBuilder {
  constructor() {
    this._criteria = {
      filters: {},
      sort: { field: 'createdAt', direction: 'desc' },
      q: '',
      cursor: null,
      limit: 20
    };
  }

  withFilters(filters) {
    this._criteria.filters = { ...this._criteria.filters, ...filters };
    return this;
  }

  withSort(sort) {
    this._criteria.sort = sort;
    return this;
  }

  withSearchText(q) {
    this._criteria.q = q;
    return this;
  }

  withCursor(cursor) {
    this._criteria.cursor = cursor;
    return this;
  }

  withLimit(limit) {
    this._criteria.limit = limit;
    return this;
  }

  /**
   * Serializes the current criteria into a JSON string for Saved Views.
   */
  toJSON() {
    return JSON.stringify(this._criteria);
  }

  /**
   * Hydrates the builder from a JSON string (Saved Views).
   */
  static fromJSON(jsonString) {
    const builder = new CriteriaBuilder();
    try {
      const parsed = JSON.parse(jsonString);
      builder._criteria = { ...builder._criteria, ...parsed };
    } catch (e) {
      console.error('[CriteriaBuilder] Failed to parse JSON', e);
    }
    return builder;
  }

  /**
   * Converts the criteria into URLSearchParams for deep linking.
   */
  toURLSearchParams() {
    const params = new URLSearchParams();
    
    if (this._criteria.q) params.set('q', this._criteria.q);
    if (this._criteria.cursor) params.set('cursor', this._criteria.cursor);
    
    // Sort
    if (this._criteria.sort.field) {
      params.set('sort', `${this._criteria.sort.field}|${this._criteria.sort.direction}`);
    }

    // Filters
    for (const [key, value] of Object.entries(this._criteria.filters)) {
      if (value !== null && value !== undefined && value !== '') {
        // Handle array values (multiselect)
        if (Array.isArray(value)) {
          params.set(`f_${key}`, value.join(','));
        } else {
          params.set(`f_${key}`, value);
        }
      }
    }

    return params;
  }

  /**
   * Hydrates the builder from URLSearchParams.
   */
  fromURLSearchParams(params) {
    if (params.has('q')) this._criteria.q = params.get('q');
    if (params.has('cursor')) this._criteria.cursor = params.get('cursor');
    
    if (params.has('sort')) {
      const [field, direction] = params.get('sort').split('|');
      this._criteria.sort = { field, direction };
    }

    // Extract filters (keys starting with f_)
    const filters = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith('f_')) {
        const filterKey = key.slice(2);
        // If it looks like a comma-separated array, we split it. 
        // In a real generic filter engine, we'd check the schema type.
        if (value.includes(',')) {
          filters[filterKey] = value.split(',');
        } else {
          filters[filterKey] = value;
        }
      }
    }
    this._criteria.filters = filters;

    return this;
  }

  build() {
    return JSON.parse(JSON.stringify(this._criteria));
  }
}
