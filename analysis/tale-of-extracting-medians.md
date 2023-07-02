# The tale of how I extracted the medians blob from makemeahanzi

Don't ask me how the data is derived. Here's how I did it.

```
cd makemeahanzi.herokuapp.com
python -m http.server 3000 --bind 127.0.0.1
```

Open the link in browser and do the following in the Web Console

```js
// Open console
// store the big parsed medians data as global constanst `temp0`

function replacer(key, value) {
  // Filtering out properties
  if (value instanceof Uint8Array) {
    return Array.from(value)
  }
  return value;
}
JSON.stringify(temp0) // copy this output
```

Paste the huge JSON file as `makemeahanzi-clone/mmah-medians/src/graphics.json`.

You are done!
