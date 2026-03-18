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

		// returns parent file history
		GetParentFileHistory() []model.FileNode

		// reset parent history
		ResetHistory()

		// returns child file arr
		GetChildFiles() []model.FileNode

		// returns child file with uuid
		GetChildFile(uuid.UUID) *model.FileNode

		// closes and deletes childnode
		DeleteChildFile(uuid.UUID) (err error)

		// promote child to parent
		CommitChildFile(uuid.UUID) (err error)

		// revert to file
		RevertToFile(uuid.UUID) (err error)

		// creates child file and return pointer
		CreateChildFile(path string, imputation []model.Imputation) (*model.FileNode, error)
	}

	fileSvc struct {
		childFiles        []model.FileNode
		parentFileHistory []model.FileNode
	}
)

func NewFileService() FileService {
	return &fileSvc{
		nil,
		[]model.FileNode{},
	}
}

func (fS *fileSvc) SetParentFile(r *http.Request) error {
	reader, err := r.MultipartReader()
	if err != nil {
		logger.Log.Errorf("failed to open multipart reader, %v", err)
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

		fS.parentFileHistory = []model.FileNode{{Path: dst.Name(), UUID: uuid.New()}}
		return nil
	}

	return io.ErrUnexpectedEOF
}

func (fS *fileSvc) IsParentFileSet() bool {
	return len(fS.parentFileHistory) != 0
}

func (fS *fileSvc) GetParentFile() *model.FileNode {
	return &fS.parentFileHistory[len(fS.parentFileHistory)-1]
}

func (fS *fileSvc) GetChildFiles() []model.FileNode {
	return fS.childFiles
}

func (fS *fileSvc) GetParentFileHistory() []model.FileNode {
	return fS.parentFileHistory
}

func (fS *fileSvc) ResetHistory() {
	fS.parentFileHistory = []model.FileNode{}
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
	_, err = os.Open(path)
	if err != nil {
		err = fmt.Errorf("failed to open child file, %v", err)
		logger.Log.Error(err)
		return nil, err
	}

	newNode := model.FileNode{
		UUID:        uuid.New(),
		Path:        path,
		Imputations: imputation,
	}

	fS.childFiles = append(fS.childFiles, newNode)

	return &fS.childFiles[len(fS.childFiles)-1], nil
}

func (fS *fileSvc) DeleteChildFile(toDeleteUUID uuid.UUID) (err error) {
	for k, node := range fS.childFiles {
		if node.UUID == toDeleteUUID {
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

func (fS *fileSvc) CommitChildFile(uuidToPromote uuid.UUID) (err error) {

	var childFile *model.FileNode
	for _, node := range fS.childFiles {
		if node.UUID == uuidToPromote {
			childFile = &node
			break
		}
	}

	if childFile == nil {
		err = fmt.Errorf("child file not found with uuid %s", uuidToPromote.String())
		logger.Log.Warning(err)
		return err
	}

	fS.parentFileHistory = append(fS.parentFileHistory, *childFile)

	fS.childFiles = []model.FileNode{}

	return nil

}

func (fS *fileSvc) RevertToFile(uuidToPromote uuid.UUID) (err error) {
	var targetFile *model.FileNode
	var targetFileIdx int

	for i, node := range fS.parentFileHistory {
		if node.UUID == uuidToPromote {
			targetFile = &node
			targetFileIdx = i
			break
		}
	}

	if targetFile == nil {
		err = fmt.Errorf("file not found with uuid %s", uuidToPromote.String())
		logger.Log.Warning(err)
		return err
	}

	fS.parentFileHistory = fS.parentFileHistory[:targetFileIdx-1]

	return nil

}
