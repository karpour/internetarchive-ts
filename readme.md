

# ![Logo](./internet-archive-ts-logo.svg) Internet Archive Typescript API client

**This is a work-in-progress verion and not fully functional.**

This API is intended to serve as a base for server-, desktop- and web-applications and offers both ways to easily fetch, create and update items from the Internet Archive as well as access the full functionality of the Archive.org API.
The code is partially based on the Internet Archive Python API client and contains all features of the python package, however no cli is included. For an out-of-the-box cli tool, please use the python package.

## To Do

- [ ] Provide native function for handling MARC
- [ ] Downloading files
- [ ] Wayback machine code
- [ ] Create hybrid ESM/CJS package (probably not needed as everything moves to ESM, and node can handle ESM/CJS better)

## Features

- Strongly typed methods
- Fine-grained error handling
- Works both in node.js and browser
- Hybrid CJS and ESM package
- 100% unit tested (WIP)
- Integration tests (WIP)

## Credentials

This API uses S3 API credentials for authentication. You can obtain them [here](https://archive.org/account/s3.php)

## Examples


## Things to figure out

- Does the curation field in item metadata always contain only one item of curation?
  It is marked as non repeatable, so if there are multiple items, how are they formatted?
- Is `<identifier>_files.xml` the only file in an item without the `mtime` and `size` fields?
- When using the user_aggs option, for every field, 25 buckets get returned. Is it possible to specifiy how many buckets are returned, or is this fixed at 25?

## Unit tests

```bash
npm test
```

## Dependencies

- [rfc6902]() - for generating JSON Patches