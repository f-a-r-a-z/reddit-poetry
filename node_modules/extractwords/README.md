# extractwords [![Build Status](https://api.travis-ci.com/f-a-r-a-z/extractwords.svg?branch=master)](https://travis-ci.com/f-a-r-a-z/extractwords)



## Install

```
$ npm install extractwords
```


## Usage

```js
const extractwords = require('extractwords');

extractwords('Good morning, how are you?');
//=> ['Good', 'morning', 'how', 'are', 'you']

extractwords("He didn't pay for his meal m'aam");
//=> ['He', "didn't", 'pay', 'for', 'his', 'meal', "m'aam"]

extractwords("17651Hello*&!(*2I'm_++`~gOOd");
//=> ['Hello', "I'm", 'gOOd']

extractwords('');
//=> []
```


## API

### extractwords(str)

#### str

Type: `string`

Text containing words to be extracted
