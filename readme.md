

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



## Unit tests

```bash
npm test
```

## Referenced Documentation

- [Save Page Now 2 Public API Docs Draft, Vangelis Banos, 2023-01-22](https://docs.google.com/document/d/1Nsv52MvSjbLb2PCpHlat0gkzw0EvtSgpKHu4mk0MnrA/edit?tab=t.0#heading=h.1gmodju1d6p0)
- [Derivative Formats](https://web.archive.org/web/20190711182843/https://archive.org/help/derivatives.php)


## Dependencies

- [rfc6902]() - for generating JSON Patches