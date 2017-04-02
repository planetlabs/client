/**
 * Convenience functions for creating search filters.  These functions return
 * objects that can be used as the `filter` property when searching for items
 * with [`items.search()`](#module:api/items~search) or when
 * saving a search with [`searches.create()`](#module:api/searches~create).
 *
 * @module api/filter
 */

/**
 * Creates a logical `AndFilter`.
 * @param {Array<Object>} filters A list of filter objects.
 * @return {Object} A filter that will match items that match all of the child
 *     filters.
 */
function and(filters) {
  return {
    type: 'AndFilter',
    config: filters
  };
}

/**
 * Creates a logical `OrFilter`.
 * @param {Array<Object>} filters A list of filter objects.
 * @return {Object} A filter that will match items that match any of the child
 *     filters.
 */
function or(filters) {
  return {
    type: 'OrFilter',
    config: filters
  };
}

/**
 * Creates a logical `NotFilter`.
 * @param {Array<Object>} filters A list of filter objects.
 * @return {Object} A filter that will match items that do not match any of the
 *     child filters.
 */
function not(filters) {
  return {
    type: 'NotFilter',
    config: filters
  };
}

/**
 * Creates a `DateRangeFilter`.
 * @param {string} field The name of the date field to use in the filter.
 * @param {Object} range An object with `gte`, `gt`, `lt`, or `lte` properties
 *     with dates (for "greater than or equal to", "greater than", "less than",
 *     and "less than or equal to").  Open ended ranges are possible.
 * @return {Object} A filter that will match items with dates in the range of
 *     provided dates.
 */
function dates(field, range) {
  var config = {};
  for (var key in range) {
    if (range[key] instanceof Date) {
      config[key] = range[key].toISOString();
    } else {
      config[key] = range[key];
    }
  }
  return {
    type: 'DateRangeFilter',
    field_name: field,
    config: config
  };
}

/**
 * Creates a `GeometryFilter`.
 * @param {string} field The name of the geometry field to use in the filter.
 * @param {Object} geometry A GeoJSON geometry.
 * @return {Object} A filter that will match items that intersect the provided
 *     geometry.
 */
function geometry(field, geometry) {
  return {
    type: 'GeometryFilter',
    field_name: field,
    config: geometry
  };
}

/**
 * Creates a `NumberInFilter`.
 * @param {string} field The name of the numeric field to use in the filter.
 * @param {Array<number>} values A list of numbers.
 * @return {Object} A filter that will match items whose field value matches
 *     any of the provided numbers.
 */
function numbers(field, values) {
  return {
    type: 'NumberInFilter',
    field_name: field,
    config: values
  };
}

/**
 * Creates a `RangeFilter`.
 * @param {string} field The name of the numeric field to use in the filter.
 * @param {Object} range An object with `gte`, `gt`, `lt`, or `lte` properties
 *     with dates (for "greater than or equal to", "greater than", "less than",
 *     and "less than or equal to").  Open ended ranges are possible.
 * @return {Object} A filter that will match items with values in the range of
 *     provided numbers.
 */
function range(field, range) {
  return {
    type: 'RangeFilter',
    field_name: field,
    config: range
  };
}

/**
 * Creates a `StringInFilter`.
 * @param {string} field The name of the string field to use in the filter.
 * @param {Array<string>} values A list of strings.
 * @return {Object} A filter that will match items whose field value matches
 *     any of the provided strings.
 */
function strings(field, values) {
  return {
    type: 'StringInFilter',
    field_name: field,
    config: values
  };
}

/**
 * Creates a `PermissionFilter`.
 * @param {Array<string>} values A list of permissions.
 * @return {Object} A filter that will match items that have all of the
 *     provided permissions.
 */
function permissions(values) {
  return {
    type: 'PermissionFilter',
    config: values
  };
}

exports.and = and;
exports.or = or;
exports.not = not;
exports.dates = dates;
exports.geometry = geometry;
exports.numbers = numbers;
exports.range = range;
exports.strings = strings;
exports.permissions = permissions;
