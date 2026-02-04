#include <mr_utils.h>
#include <utils.h>
#include <w_window.h>

#include <SDL3/SDL.h>

SDL_Window *W_window_create(MrlLogger *logger, int width, int height)
{
	mrl_logln(logger, MRL_SEVERITY_DEFAULT, "initing window...");

	SDL_Init(SDL_INIT_VIDEO);

	SDL_Window *window =
		SDL_CreateWindow("virt", width, height, SDL_WINDOW_FULLSCREEN);
	if (!window) {
		mrl_logln(logger, MRL_SEVERITY_ERROR,
			  "failed to init window, %s", SDL_GetError());
		return NULL;
	}

	mrl_logln(logger, MRL_SEVERITY_OK, "initing window ok");
	return window;
}

void W_window_destroy(SDL_Window *window)
{
	SDL_DestroyWindow(window);
	return;
}
