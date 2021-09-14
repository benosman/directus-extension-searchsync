function flattenObject(ob) {
	const toReturn = {};

	for (const i in ob) {
		if (!ob.hasOwnProperty(i)) continue;

		if (typeof ob[i] == 'object' && ob[i] !== null) {
			const flatObject = flattenObject(ob[i]);
			for (const x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;

				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

/**
 * Lookup and return junction item if set.
 */
function getJunctionItem(item, junctionField) {
	if (junctionField != null) {
		if (item.hasOwnProperty(junctionField)) {
			return item[junctionField];
		}
	} else {
		return item;
	}
}

/**
 * Display relational item, pass in field name or function
 */
function displayRelationalItem(item, display, parentField = null, delimiter = null) {
	let value = null;
	let parents = [];

	if (item != null && typeof item == 'object') {
		if (parentField != null && item.hasOwnProperty(parentField)) {
			const parentItem = item[parentField];
			if (parentItem != null && typeof parentItem == 'object') {
				parents = displayRelationalItem(parentItem, display, parentField, delimiter);
			}
		}
		if (typeof display == 'string') {
			if (item.hasOwnProperty(display) && item[display] != null) {
				value = item[display];
			}
		} else if (typeof display == 'function') {
			value = display(item);
		}
	}

	if (parentField != null) {
		if (parents.length > 0) {
			if (delimiter) {
				value = [parents[0], value].join(delimiter);
			}
			return [value, ...parents];
		}
		return [value];
	}
	return value;
}

/**
 * Returns an array of values from a Relation field
 */
function flattenRelational(field, display, junctionField = null) {
	const toReturn = [];

	for (const rootItem of field) {
		if (typeof rootItem == 'object') {
			const item = getJunctionItem(rootItem, junctionField);
			const value = displayRelationalItem(item, display);
			if (value != null) {
				toReturn.push(value);
			}
		}
	}
	if (toReturn.length === 1) {
		return toReturn[0];
	}
	return [...new Set(toReturn)];
}

/**
 * Returns an algolia compatible map for a hierarchical Many-to-Many field
 */
function flattenHierarchical(field, parentField, display, junctionField = null, delimiter = ' > ') {
	const levels = [];

	for (const rootItem of field) {
		if (typeof rootItem == 'object' && rootItem.hasOwnProperty(junctionField) && rootItem[junctionField] != null) {
			const item = getJunctionItem(rootItem, junctionField);
			const values = displayRelationalItem(item, display, parentField, delimiter);
			for (let [index, value] of values.reverse().entries()) {
				if (value != null) {
					(levels[index] = levels[index] || []).push(value);
				}
			}
		}
	}

	const toReturn = {};
	if (levels.length > 0) {
		for (let [index, value] of levels.entries()) {
			toReturn[`lvl${index}`] = Array.isArray(value) ? [...new Set(value)] : value;
		}
	}
	return toReturn;
}

/**
 * Returns a new object with the values at each key mapped using mapFn(value)
 */
function objectMap(object, mapFn) {
	return Object.keys(object).reduce(function (result, key) {
		const value = object[key];
		if (value instanceof Object) {
			result[key] = value;
		} else {
			result[key] = mapFn(object[key], key);
		}
		return result;
	}, {});
}

module.exports = { flattenObject, flattenRelational, flattenHierarchical, objectMap };
