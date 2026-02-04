#include "g_gamestate.h"

#include <mr_utils.h>
#include <stdlib.h>

Uint32 frame_ticks;

struct G_GameState *G_gamestate_create(int target_fps, int window_width,
				       int window_height, float scale)
{
	struct G_GameState *gamestate = malloc(sizeof(struct G_GameState));
	gamestate->target_fps = target_fps;
	gamestate->target_frametime_ms = (1000.0 / (double)target_fps);
	gamestate->window_w = window_width;
	gamestate->window_h = window_height;
	gamestate->scale = scale;

	return gamestate;
}

void G_gamestate_destroy(struct G_GameState *gamestate)
{
	free(gamestate);
}

void G_frame_start(struct G_GameState *gamestate)
{
	gamestate->frame_ticks_start = SDL_GetTicks();
}

void G_frame_end(struct G_GameState *gamestate)
{
	frame_ticks = SDL_GetTicks() - gamestate->frame_ticks_start;
	if (frame_ticks < gamestate->target_frametime_ms) {
		SDL_Delay(gamestate->target_frametime_ms - frame_ticks);
	}
}
