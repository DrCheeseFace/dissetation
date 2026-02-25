package main

import (
	"fmt"
	"visu-backend/configuration"
	"visu-backend/router"
	"visu-backend/logger"

	"net/http"
)

func log_banner(host string) {

	logger.Log.Noticef(`
/**
 *
 *    running on %s
 *
 * ____   ____.___  _____________ ___ 
 *\   \ /   /|   |/   _____/    |   \
 * \   Y   / |   |\_____  \|    |   /
 *  \     /  |   |/        \    |  / 
 *   \___/   |___/_______  /______/  
 *                       \/
 */
	`, host)

}

func main() {
	configuration.Init()
	var router = router.NewRoutes()
	err := logger.Init()
	if err != nil {
		err = fmt.Errorf("ERROR: %w\n ABORTING", err)
		fmt.Print(err)
		return
	}

	cfg := configuration.State.ServiceConfig
	log_banner(fmt.Sprintf("http://%s:%s", cfg.Host, cfg.Port))
	err = http.ListenAndServe(fmt.Sprintf(":%s", cfg.Port), router)
	fmt.Println(err)
}

