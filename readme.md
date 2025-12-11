

# ![Logo](./internet-archive-ts-logo.svg) Internet Archive Typescript API client

**This is a work-in-progress verion and not fully functional.**

This API is intended to serve as a base for server-, desktop- and web-applications and offers both ways to easily fetch, create and update items from the Internet Archive as well as access the full functionality of all APIs offered by archive.org, including the WaybackMachine.
The code is partially based on the Internet Archive Python API client and contains all features of the python package, however no cli is included. For an out-of-the-box cli tool, please use the python package.

## Features

- Strongly typed methods
- Fine-grained error handling
- Convenience functions
- Works both in node.js and browser
- 100% unit tested (WIP)
- Integration tests (WIP)

### Strong typing

Strong types are used to enjoy a good developer experience. Return types are dependent on the input, for example when fields to return are supplied.

Example:

```typescript
const result = await waybackMachine.getSnapshotMatches("https://twitter.com/internetarchive/", {
    limit: 10
});
const digest = matches[0].digest; // OK
```

```typescript
const result = await waybackMachine.getSnapshotMatches("https://twitter.com/internetarchive/", {
    fl: ["urlkey", "mimetype", "statuscode", "timestamp"],
    limit: 10
});
const digest = matches[0].digest;
// Property 'digest' does not exist on type '{ urlkey: string; timestamp: string; mimetype: string; statuscode: string; }'
```

## Credentials

This API uses S3 API credentials for authentication. You can obtain them [here](https://archive.org/account/s3.php)

## Examples

Example `.ts` files are located in [src/examples](https://github.com/karpour/internetarchive-ts/tree/main/src/examples)

### Get item

```typescript
const item = await getItem('nasa');
    
console.log(`Identifier: ${item.identifier}`);
console.log(`Item size: ${item.item_size}`);
console.log(`Date: ${item.created}`);
```

## Unit tests

```bash
npm run test:unit
```

## Referenced Documentation

- [Wayback CDX Server](https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server)
- [Save Page Now 2 Public API Docs Draft, Vangelis Banos, 2023-01-22](https://docs.google.com/document/d/1Nsv52MvSjbLb2PCpHlat0gkzw0EvtSgpKHu4mk0MnrA/edit?tab=t.0#heading=h.1gmodju1d6p0)
- [Derivative Formats](https://web.archive.org/web/20190711182843/https://archive.org/help/derivatives.php)


## Dependencies

- [rfc6902](https://github.com/chbrown/rfc6902) - for generating JSON Patches
- [minimatch](https://github.com/isaacs/minimatch) - for parsing globs