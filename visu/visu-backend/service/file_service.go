package service

import (
	"crypto/sha1"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"visu-backend/logger"
	"visu-backend/model"

	"github.com/google/uuid"
)

type (
	FileService interface {
		// sets parent file (user fed file)
		SetParentFile(r *http.Request) (err error)

		// checks if fileSvc.parentFile != nil
		IsParentFileSet() bool

		// returns file handler ref
		GetParentFile() *model.FileNode

		// returns child file arr
		GetChildFiles() []model.FileNode

		// creates child file and return pointer
		CreateChildFile(path string, imputation model.Imputation) (*model.FileNode, error)

		// closes parent and child file
		CloseAllFiles() error
	}

	fileSvc struct {
		parentFile *model.FileNode
		childFiles []model.FileNode
	}
)

func NewFileService() FileService {
	return &fileSvc{
		nil,
		[]model.FileNode{},
	}
}

func (fS *fileSvc) CloseAllFiles() (err error) {
	if fS.parentFile != nil {
		err = fS.parentFile.File.Close()
		if err != nil {
			err := fmt.Errorf("failed to close parent file %s, %v", fS.parentFile.Path, err)
			logger.Log.Error(err)
			return err
		}

		fS.parentFile = nil
	}

	for _, v := range fS.childFiles {
		err := v.File.Close()
		if err != nil {
			err := fmt.Errorf("failed to close child file %s, %v", v.Path, err)
			logger.Log.Error(err)
			return err
		}
	}

	fS.childFiles = nil

	return nil
}

func (fS *fileSvc) SetParentFile(r *http.Request) error {
	reader, err := r.MultipartReader()
	if err != nil {
		logger.Log.Errorf("failed to open multipart reader, %v", err)
		return err
	}

	err = fS.CloseAllFiles()
	if err != nil {
		logger.Log.Errorf("failed to clear root file, %v", err)
		return err
	}

	for {
		part, err := reader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			logger.Log.Errorf("failed to read next part of file")
			return err
		}

		if part.FileName() == "" {
			continue
		}

		fp := filepath.Join("./uploads", part.FileName())
		dst, err := os.OpenFile(fp, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0666)
		if err != nil {
			logger.Log.Errorf("failed to create file '%s' ", fp)
			return err
		}

		hash := sha1.New()
		mw := io.MultiWriter(dst, hash)

		if _, err := io.Copy(mw, part); err != nil {
			_ = dst.Close()
			logger.Log.Errorf("failed to copy part '%s' to dest '%s' ", part.FileName(), fp)
			return err
		}

		if _, err := dst.Seek(0, 0); err != nil {
			_ = dst.Close()
			return err
		}

		fS.parentFile = &model.FileNode{File: dst, Path: dst.Name(), UUID: uuid.New()}
		return nil
	}

	return io.ErrUnexpectedEOF
}

func (fS *fileSvc) IsParentFileSet() bool {
	return fS.parentFile.File != nil
}

func (fS *fileSvc) GetParentFile() *model.FileNode {
	return fS.parentFile
}

func (fS *fileSvc) GetChildFiles() []model.FileNode {
	return fS.childFiles
}

func (fS *fileSvc) CreateChildFile(path string, imputation model.Imputation) (childFile *model.FileNode, err error) {
	f, err := os.Open(path)
	if err != nil {
		err = fmt.Errorf("failed to open child file, %v", err)
		logger.Log.Error(err)
		return nil, err
	}

	fS.childFiles = append(fS.childFiles, model.FileNode{UUID: uuid.New(), File: f, Path: path, Imputation: imputation})
	return &fS.childFiles[len(fS.childFiles)], nil
}
