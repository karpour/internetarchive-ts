# Consistency in subject metadata field

The metadata of the item `youtube-Tdj8gh9GPc4` has a single string as a subject, which is tags separated by `;` (instead of `,`). This is assumed to be a mistake by the uploader

https://archive.org/metadata/youtube-Tdj8gh9GPc4/metadata/subject

Value of subjects is

```json
"Youtube;video;Education;the;computer;chronicles;stewart;cheifet;gary;kildall;cp/m;vintage;computing;computers;old;ms-dos;dec;vax;mainframe;unix;tv;show;public;access;pbs;bill;gates;ms;dos;microsoft;amiga;commodore;64;vic20;vic;20;episodes;full;high"
```

However, in a search result using the advancedSearch API endpoint, the subject fields appear properly parsed.

```json
{
    //...
    "identifier": "youtube-Tdj8gh9GPc4",
    //...
    "subject": [
        "Youtube",
        "video",
        //...
        "high"
    ],
    //...
}   
```

What I assume is that at one point during indexing in ElasticSearch, subject fields actually do get split on semicolons, however the item metadata itself still has the un-split string as subject, introducing an inconsistency between item metadata and search result.

# "Any field" + "does not contain" does not work in search

Filling the form to set `Any field` to `does not contain` and value to `computer` produces results that all contain the word computer.

Expected result would be a list of items where no field contains computer, including title.

See https://archive.org/search?query=-%28computer%29

# Wrong content-type for range error

Trying to query the advancedsearch API endpoint pagination enabled and a `rows` argument above the maximum (10000) results in an Error, as expected.

However, the content-type is `application/json`.

For the following request:

https://archive.org/advancedsearch.php?q=computer%20chronicles&output=json&rows=10001&page=8&fl[]=identifier

The expected response body would be:

```json
{
    "error": "[RANGE_OUT_OF_BOUNDS] paging is only supported through 10000 results; scraping is supported through the Scraping API, see https://archive.org/help/aboutsearch.htm  or, you may request up to 1000000000 results at one time if you do NOT specify any page. For best results,  do NOT specify sort (sort may be automatically disabled for very large queries)."
}
```

The actual response is just plaintext:

```plaintext
[RANGE_OUT_OF_BOUNDS] paging is only supported through 10000 results; scraping is supported through the Scraping API, see https://archive.org/help/aboutsearch.htm  or, you may request up to 1000000000 results at one time if you do NOT specify any page. For best results,  do NOT specify sort (sort may be automatically disabled for very large queries).
```

# Advanced search results as JSON

On the web interface a user can choose JSON output for an advanced search query. The output however is json-callback rather than the expected regular JSON

Query: https://archive.org/advancedsearch.php?q=computer+chronicles&fl%5B%5D=description&fl%5B%5D=identifier&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=50&page=1&output=json&callback=callback&save=yes

Expected result:

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 642,
    "params": {
        //...
    }
}
```

Actual Result:

```javascript
callback({"responseHeader":{"status":0,"QTime":3815,"params":{"query":"(( ( (title:computer^100 OR salients:computer^50 OR subject:computer^25 OR description:computer^15 OR collection:computer^10 OR language:computer^10 OR text:computer^1) (title:chronicles^100 OR salients:chronicles^50 ..."}}}
```

Suggestion: remove the callback parameter when users select JSON output

# Scroll parameter in the FTS api

Looking at the python code, it seems that when adding a `scroll=true` parameter to a request to https://be-api.us.archive.org/ia-pub-fts-api, the result should have a `_scroll_id` field. However, I could not get this to work. Is there any documentation on this?

# Aggregatable fields

When using user_aggs, the advancedSearch endpoint will return an error whenever a supplied field is type `text` in ElasticSearch. If the field does not exist anywhere (in the search results or overall?) the endpoint won't fail and return empty aggregations for that field instead.

Since any arbitrary metadata will also be `text` in ElasticSearch, it would be good to have a definite list of field that *can* be aggregated.

Through trial and error, I arrived at the following list of fields that can be aggregated:

```typescript
export const IA_AGGREGATABLE_FIELDS = [
    'mediatype',
    'addeddate',
    'publicdate',
    'collection',
    'date',
    'uploader',
    'subject',
    'contributor',
    'imagecount',
    'public_format',
    'updatedate',
    'foldoutcount',
    'related_external_id',
    'licenseurl',
    'bookreader_defaults',
    'openlibrary_edition',
    'openlibrary_work',
    'call_number',
    'isbn',
    'condition_visual',
    'type',
    'year'
] as const;
```

There are likely fields I missed, so a definite list would be useful.

# Fixer ops

What is the complete list of possible fixer ops?

# Valid identifier

What are the rules for a valid identifier? Ideally a regular expression

# Valid metadata keys

What are the exact rules for a valid metadata key? Ideally regular expression