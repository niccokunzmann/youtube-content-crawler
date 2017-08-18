# youtube-content-crawler
Fetching Youtube videos by given channel ids; posting their converted meta information to a Schul-Cloud endpoint.

## INSTALL
call: 
´´npm install´´
AND FOR THE TIME BEING:
´´ 
cd ./local_modules/
npm install
´´

## Basics
The Schul-Cloud crawlers are a growing bunch of small pieces of code, intented to be coded by a Schul-Cloud community. Thus, our team tries to show several ways to participate and code a custom crawler for other content providers.
As the resulting items are to deliver destinct metadata such as "tags", the youtube api fetching has two internal steps. Furthermore this crawler needs some configuration .


## Infrastructure of the Crawler
Beside the usuals, there are some more directories:
- ./config - the place for credentials and Youtube informations like list of channels and so on
- ./local_modules - for dev convenience, two small modules are placed here: one for the bare Youtube functionality, the other for some crawler logic. The latter should be placed elsewhere in the next release.
- routes - Only one express router: index.js

The directories ./config and ./node_modules are git ignored.
 

## Configuring the Crawler / starting with no configuration 
There are three options to provide: the apikey for the Youtube API, an array of Youtube channels to be fetched an the URI of the endpoint the information has to be posted to. When you call this app for the first time - with an empty config dir - a default json config ("local.json") gets generated for you to be filled with your specs.

## Calling the Crawler
The whole crawler is just an express subapp; you could start it for testing using "npm start".

## Authorization
For sending data to the official Schul-Cloud content service you need a Schul-Cloud account and pass your credentials via process.env:
CONTENT_USER, CONTENT_PASSWORD.

## TODOs
- Simplify the config handling, which is the rest of an idea in another direction. 
- Using Promise instead of callback at certain points.
- Find another place for the crawler logic, which is unhandy as a module.
- Maybe stress testing for a bigger bunch of channels.
- Maybe make sc_youtube a real npm module.

