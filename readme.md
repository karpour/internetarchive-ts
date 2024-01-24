# Internet Archive Typescript API client

**This is a work-in-progress verion and not fully functional.**

This API is intended to serve as a base for server-, desktop- and web-applications and offers both ways to easily fetch items from the archive as well as access the full functionality of the Archive.org API.
The code is based on the Internet Archive Python API client and contains all features of the python package, however no cli is included. For an out-of-the-box cli tool, please use the python package.

## Features



Rather than just returning parsed JSON, the wrapper also includes type definitions for most of the API and type conversion (strings that are numbers to numbers, best-guess parsing of dates)

## Examples


## Things to figure out

- Does the curation field in item metadata always contain only one item of curation?
  It is marked as non repeatable, so if there are multiple items, how are they formatted?

## Tests




(?<=[\s\.=\(])(?:[a-z]+_)+[a-z]+(?=[\.\s\(=:,\)])

## ToDo