# Simple search engine indexer

> ### This extension is in development and could have breaking changes until Directus 9 official releases.

## Supported engines

- MeiliSearch
- ElasticSearch
- Algolia

## How to install

### Install as a dependency in `package.json`

```json
{
	"dependencies": {
		"directus-extension-searchsync": "^dimitrov-adrian/directus-extension-searchsync#v1.0.0-rc.85"
	}
}
```

Then do `npm install`

### Install latest from git as custom extension in `./extensions`

Simple quick install step, just copy and paste in your Directus project root directory.

```bash
# Go your directus extensions directory
cd hooks
git clone https://github.com/dimitrov-adrian/directus-extension-searchsync.git
cd directus-extension-searchsync
npm install
```

## Configuration

Default configuration file should be placed under the same directory like the Directus `.env` file with name `searchsync.config.js` or `searchsync.config.js` or could be given by `EXTENSION_SEARCHSYNC_CONFIG_PATH` variable

On docker cotainer it's by default under `/directus` directory.

### Environment variables

- `EXTENSION_SEARCHSYNC_CONFIG_PATH` A .js or .json file path with extension configuration to use, if not set, then extension will look in `CONFIG_PATH` where Directus .env file is placed.

### References

- `server: object` Holds configuration for the search engine
- `reindexOnStart: boolean` Performs full reindex of all documents upon Directus starts
- `collections: object` Indexing data definition
- `collections.<collection>.filter: object` The filter query in format like Directus on which item must match to be indexed (check [Filter Rules
  ](https://docs.directus.io/reference/filter-rules/#filter-rules))
- `collections.<collection>.fields: array<string>` Fields that will be indexed in Directus format
- `collections.<collection>.transform: function` (Could be defined only if config file is .js) A callback to return transformed/formatted data for indexing.
- `collections.<collection>.indexName: string` Force collection name when storing in search index
- `collections.<collection>.collectionField: string` If set, such field with value of the collection name will be added to the indexed document. Useful with conjuction with the _indexName_ option

### Examples

#### `searchsync.config.json`

```json
{
	"server": {
		"type": "meilisearch",
		"host": "http://search:7700",
		"key": "the-private-key"
	},
	"reindexOnStart": true,
	"collections": {
		"products": {
			"filter": {
				"status": "published",
				"stock": "inStock"
			},
			"fields": [
				"title",
				"image.id",
				"category.title",
				"brand.title",
				"tags",
				"description",
				"price",
				"rating"
			]
		},
		"posts": {
			"indexName": "blog_posts",
			"collectionField": "_collection",

			"filter": {
				"status": "published"
			},
			"fields": ["title", "teaser", "body", "thumbnail.id"]
		}
	}
}
```

#### `searchsync.config.js`

```javascript
module.exports = {
	server: {
		type: "meilisearch",
		host: "http://search:7700",
		key: "the-private-key",
	},
	reindexOnStart: true,
	collections: {
		pages: {
			filter: {
				status: "published",
			},
			fields: ["title", "teaser", "body", "thumbnail.id"],
			transform: (item, { flattenObject, striptags }) => {
				return {
					...flattenObject(item),
					body: striptags(item.body),
					someCustomValue: "Hello World!",
				};
			},
		},
	},
};

// Or functional way
module.exports = ({ env }) => {
	return {
		server: {
			// ...
		},
		collections: {
			// ...
		},
	};
};
```

##### Collection transformation callback description

```javascript
/**
 * @param {Object} item
 * @param {{striptags, flattenObject, objectMap}} utils
 * @param {String} collectionName
 * @returns {Object}
 */
function (item, { striptags, flattenObject, objectMap }, collectionName) {
	return item
}
```

#### Search engines config references

##### Meilisearch

```json
{
	"type": "meilisearch",
	"host": "http://search:7700",
	"key": "the-private-key"
}
```

##### Algolia

```json
{
	"type": "algolia",
	"appId": "Application-Id",
	"key": "secret-api-key"
}
```

##### ElasticSearch

New typeless behaviour, use collection names as index name.

```json
{
	"type": "elasticsearch",
	"host": "http://search:9200/"
}
```

##### ElasticSearch for 5.x and 6.x

Old type behaviour, use collection names as types.

```json
{
	"type": "elasticsearch_legacy",
	"host": "http://search:9200/projectindex"
}
```
