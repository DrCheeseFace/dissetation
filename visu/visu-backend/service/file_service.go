package service

import (
	"crypto/sha1"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"visu-backend/logger"
)

type (
	FileService interface {
		// sets parent file (user fed file)
		SetParentFile(r *http.Request) (err error)
		IsParentFileSet() bool

		// closes parent and child file
		CloseAllFiles() error

		// returns ok
		GetHealth() error
	}

	fileSvc struct {
		imputerSvc ImputerService
		parentFile *os.File
		childFiles map[string]*os.File
	}
)

func NewFileService(imputerSvc ImputerService) FileService {
	return fileSvc{
		imputerSvc,
		nil,
		make(map[string]*os.File),
	}
}

func (fS fileSvc) CloseAllFiles() (err error) {
	if fS.parentFile != nil {
		err = fS.parentFile.Close()
		if err != nil {
			err := fmt.Errorf("failed to close parent file %s, %w", fS.parentFile.Name(), err)
			logger.Log.Error(err)
			return err
		}
	}

	for _, v := range fS.childFiles {
		err := v.Close()
		if err != nil {
			err := fmt.Errorf("failed to close child file %s, %w", v.Name(), err)
			logger.Log.Error(err)
			return err
		}
	}

	return nil
}

func (fS fileSvc) SetParentFile(r *http.Request) error {
	reader, err := r.MultipartReader()
	if err != nil {
		logger.Log.Errorf("failed to open multipart reader, %w", err)
		return err
	}

	err = fS.CloseAllFiles()
	if err != nil {
		logger.Log.Errorf("failed to clear root file, %w", err)
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
			dst.Close()
			logger.Log.Errorf("failed to copy part '%s' to dest '%s' ", part.FileName(), fp)
			return err
		}

		if _, err := dst.Seek(0, 0); err != nil {
			dst.Close()
			return err
		}

		fS.parentFile = dst
		return nil
	}

	return io.ErrUnexpectedEOF
}

func (fS fileSvc) IsParentFileSet() bool {
	return fS.parentFile != nil
}

func (fS fileSvc) GetHealth() error {
	return fS.imputerSvc.GetHealth()
}
