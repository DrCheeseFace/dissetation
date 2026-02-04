#ifndef W_WINDOW_H
#define W_WINDOW_H

#include <SDL3/SDL.h>
#include <mr_utils.h>

SDL_Window *W_window_create(MrlLogger *logger, int width, int height);

void W_window_destroy(SDL_Window *window);

#endif // !W_WINDOW_H
