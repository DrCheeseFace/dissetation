CC          = emcc
CSTANDARD   = c99

WASM_FLAGS  = -s EXPORTED_FUNCTIONS='["_main", "_malloc", "_free", "_get_dynamic_float_array", "_process_complex_math", "_count_primes", "_shuffle_static_pool", "_prime_memory", "_create_single_object", "_free_ptr"]' \
              -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","FS","HEAPF32"]' \
              -s FORCE_FILESYSTEM=1 \
              -s NO_EXIT_RUNTIME=1 \
              -s ALLOW_MEMORY_GROWTH=1 \
              -msimd128 \
              -ffast-math \
              -O3 \
              -s MODULARIZE=1 \
              -s EXPORT_NAME='createModule'

all: public/wasm/index.js

public/wasm/index.js: src/c/main.c
	@mkdir -p public/wasm
	$(CC) src/c/main.c -o $@ $(WASM_FLAGS) -Wall

bear:
	bear -- $(MAKE) clean all

clean:
	rm -rf public/wasm
	rm -f compile_commands.json
