package router

import (
	"visu-backend/handler"
	"visu-backend/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRoutes() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	fileSvc := service.NewFileService()
	fileHandler := handler.NewFileHandler(fileSvc)

	imputerSvc := service.NewImputerService(fileSvc)
	imputerHandler := handler.NewImputerHandler(imputerSvc, fileSvc)

	r.Route("/health", func(r chi.Router) {
		r.Get("/", imputerHandler.GetHealth)
	})

	r.Route("/dataset", func(r chi.Router) {
		r.Post("/", fileHandler.UploadParentFile)
		r.Get("/", imputerHandler.GetParentFileInfo)
	})

	return r
}
