- GUI that displays information about missing data also allows 
    an interactive experience for imputing data with different methods.

- can handle large datasets in ~realtime

### tools
- emcc
- wasm Emscripten.
- d3 for data visualization 

``` bash
emcc file_reader.c -o file_reader.js \
    -s FORCE_FILESYSTEM=1 \
    -s EXPORTED_RUNTIME_METHODS=['FS'] \
    -s NO_EXIT_RUNTIME=1
```
