FROM golang:1.25.1-alpine3.22

ENV GO111MODULE=on

WORKDIR /app

COPY go.mod go.sum . 

RUN go mod download

RUN go mod tidy 

RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=bind,source=./go.sum,target=go.sum \
    --mount=type=bind,source=./go.mod,target=go.mod \
    go mod download -x

ENV GOCACHE=/root/.cache/go-build

RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=cache,target="/root/.cache/go-build" \
    --mount=type=bind,target=. \
    go build -o /tmp/app .

COPY . . 

RUN CGO_ENABLED=0 GOOS=linux go build -o /visu-go-server

EXPOSE 5155 

CMD ["/visu-go-server"]

