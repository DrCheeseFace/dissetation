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
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
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

	r.Route("/info", func(r chi.Router) {
		r.Get("/", imputerHandler.GetFilesInfo)
		r.Get("/history", imputerHandler.GetParentHistory)
		r.Get("/{uuid}/missiG", imputerHandler.GetMissiGInfo)
		r.Get("/{uuid}/missing_matrix", imputerHandler.GetMissingMatrixInfo)
		r.Get("/{uuid}/sample/{n}", imputerHandler.GetSample)
		r.Get("/compare/{uuid1}/{uuid2}", imputerHandler.GetCompareInfo)
		r.Post("/{uuid}/rows", imputerHandler.GetRows)
	})

	r.Route("/dataset", func(r chi.Router) {
		r.Delete("/{uuid}", fileHandler.DeleteChildFile)
		r.Patch("/{uuid}", fileHandler.CommitChild)
		r.Post("/", fileHandler.UploadParentFile)
		r.Patch("/revert/{uuid}", fileHandler.RevertToFile)
	})

	r.Route("/impute", func(r chi.Router) {
		r.Post("/simple", imputerHandler.PostSimpleImpute)
		// TODO test without catagorical data
		r.Post("/knn", imputerHandler.PostKNNImpute)
	})

	return r
}
