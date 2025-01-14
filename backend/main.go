package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/melsonic/vidcon/core"
)

var addr = flag.String("addr", "localhost:8080", "http service address")

func main() {
	flag.Parse()
	http.HandleFunc("/ws", core.WSHandler)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
