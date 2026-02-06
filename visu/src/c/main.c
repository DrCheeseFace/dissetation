#include <emscripten.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
	int id;
	float value;
} DataObject;

DataObject *static_pool = NULL;
int pool_size = 0;

EMSCRIPTEN_KEEPALIVE
void prime_memory(int size)
{
	if (static_pool)
		free(static_pool);
	pool_size = size;
	static_pool = malloc(size * sizeof(DataObject));
	if (static_pool) {
		memset(static_pool, 0, size * sizeof(DataObject));
		printf("C: Memory primed for %d objects\n", size);
	}
}

EMSCRIPTEN_KEEPALIVE
void shuffle_static_pool()
{
	if (!static_pool)
		return;
	volatile DataObject *obj = (volatile DataObject *)static_pool;
	for (int i = 0; i < pool_size; i++) {
		float temp = obj[i].value;
		obj[i].value = (float)obj[i].id;
		obj[i].id = (int)temp;
	}
}

EMSCRIPTEN_KEEPALIVE
void process_complex_math(float *arr, int size)
{
	for (int i = 0; i < size; i++) {
		float val = (float)i;
		arr[i] = sinf(val) * cosf(val) * sqrtf(val);
	}
}

EMSCRIPTEN_KEEPALIVE
int count_primes(int upper_limit)
{
	int count = 0;
	for (int i = 2; i <= upper_limit; i++) {
		bool is_prime = true;
		for (int j = 2; j * j <= i; j++) {
			if (i % j == 0) {
				is_prime = false;
				break;
			}
		}
		if (is_prime)
			count++;
	}
	return count;
}

EMSCRIPTEN_KEEPALIVE
DataObject *create_single_object(int id, float val)
{
	DataObject *obj = malloc(sizeof(DataObject));
	if (obj) {
		obj->id = id;
		obj->value = val;
	}
	return obj;
}

EMSCRIPTEN_KEEPALIVE
float *get_dynamic_float_array(int size)
{
	return (float *)malloc(size * sizeof(float));
}

EMSCRIPTEN_KEEPALIVE
void free_ptr(void *ptr)
{
	if (ptr)
		free(ptr);
}

int main()
{
	printf("Wasm Ready with Bootstrap UI\n");
	return 0;
}
