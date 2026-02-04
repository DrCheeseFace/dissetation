#ifndef G_GAMESTATE_H
#define G_GAMESTATE_H

#include <SDL3/SDL.h>

struct G_GameState {
	Uint32 frame_ticks_start;
	float scale;
	int window_w;
	int window_h;
	double target_fps;
	double target_frametime_ms;
};

struct G_GameState *G_gamestate_create(int target_fps, int window_width,
				       int window_height, float scale);

void G_frame_start(struct G_GameState *gamestate);

void G_frame_end(struct G_GameState *gamestate);

void G_gamestate_destroy(struct G_GameState *gamestate);

#endif // !G_GAMESTATE_H
