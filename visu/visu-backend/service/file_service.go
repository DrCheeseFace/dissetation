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
	"visu-backend/utils"

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

		// returns child file with uuid
		GetChildFile(uuid.UUID) *model.FileNode

		// closes and deletes childnode
		DeleteChildFile(uuid.UUID) (err error)

		// promote child to parent
		PromoteChildFile(uuid.UUID) (err error)

		// creates child file and return pointer
		CreateChildFile(path string, imputation []model.Imputation) (*model.FileNode, error)

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

func (fS *fileSvc) GetChildFile(uuid uuid.UUID) *model.FileNode {
	for _, k := range fS.childFiles {
		if k.UUID == uuid {
			return &k
		}
	}
	return nil
}

func (fS *fileSvc) CreateChildFile(
	path string,
	imputation []model.Imputation,
) (childFile *model.FileNode, err error) {
	f, err := os.Open(path)
	if err != nil {
		err = fmt.Errorf("failed to open child file, %v", err)
		logger.Log.Error(err)
		return nil, err
	}

	newNode := model.FileNode{
		UUID:        uuid.New(),
		File:        f,
		Path:        path,
		Imputations: imputation,
	}

	fS.childFiles = append(fS.childFiles, newNode)

	return &fS.childFiles[len(fS.childFiles)-1], nil
}

func (fS *fileSvc) DeleteChildFile(toDeleteUUID uuid.UUID) (err error) {
	for k, node := range fS.childFiles {
		if node.UUID == toDeleteUUID {

			_ = node.File.Close()

			err = os.Remove(node.Path)
			if err != nil {
				err = fmt.Errorf("failed to delete child file, %v", err)
				logger.Log.Error(err)
				return err
			}

			fS.childFiles = utils.Remove(fS.childFiles, k)
			return nil
		}
	}

	logger.Log.Warningf("file not found with uuid %s", toDeleteUUID.String())
	return nil
}

func (fS *fileSvc) PromoteChildFile(uuidToPromote uuid.UUID) (err error) {
	var childFile *model.FileNode
	var childFileIdx int

	for i, node := range fS.childFiles {
		if node.UUID == uuidToPromote {
			childFile = &node
			childFileIdx = i
			break
		}
	}

	if childFile == nil {
		err = fmt.Errorf("child file not found with uuid %s", uuidToPromote.String())
		logger.Log.Warning(err)
		return err
	}

	if fS.parentFile == nil {
		logger.Log.Warning("parent file not set")
		fS.parentFile = childFile
		fS.childFiles = utils.Remove(fS.childFiles, childFileIdx)
		return nil
	}

	err = fS.parentFile.File.Close()
	if err != nil {
		logger.Log.Errorf("failed to close parent file, %v", err)
		return err
	}

	err = os.Remove(fS.parentFile.Path)
	if err != nil {
		logger.Log.Errorf("failed to delete parent file, %v", err)
		return err
	}

	fS.parentFile = childFile

	fS.childFiles = utils.Remove(fS.childFiles, childFileIdx)

	return nil

}
