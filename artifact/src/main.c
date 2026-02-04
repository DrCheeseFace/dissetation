
#include "mr_utils/mrl_logger.h"
#include <g_gamestate.h>
#include <mr_utils.h>
#include <utils.h>
#include <w_window.h>

#include <SDL3/SDL.h>

void main_loop(void)
{
	return;
}

int main(void)
{
	struct G_GameState *gamestate = G_gamestate_create(
		TARGET_FPS, WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_SCALE);

	MrlLogger *logger = mrl_create(stderr, TRUE, TRUE);

	SDL_Window *sdl_window = W_window_create(logger, gamestate->window_w,
						 gamestate->window_h);
	if (!sdl_window) {
		goto err_sdl_window_creation;
	}

	ignore sdl_window;

	for (;;) {
		if (0) {
			// TODO
			break;
		}
	}

err_sdl_window_creation:
	W_window_destroy(sdl_window);
	mrl_destroy(logger);
	SDL_Quit();
	G_gamestate_destroy(gamestate);

	return 0;
}
