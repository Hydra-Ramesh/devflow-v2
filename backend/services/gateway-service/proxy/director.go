package proxy

import (
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/middleware"
)

func SingleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

func NewDirector(target *url.URL, originalDirector func(*http.Request), pathPrefixToStrip, pathPrefixToPrepend string) func(*http.Request) {
	return func(req *http.Request) {
		inboundPath := req.URL.Path

		originalDirector(req)

		req.Host = target.Host

		if pathPrefixToStrip != "" && strings.HasPrefix(inboundPath, pathPrefixToStrip) {
			inboundPath = strings.TrimPrefix(inboundPath, pathPrefixToStrip)
		}

		if pathPrefixToPrepend != "" {
			inboundPath = SingleJoiningSlash(pathPrefixToPrepend, inboundPath)
		}

		if target.Path != "" && target.Path != "/" {
			inboundPath = SingleJoiningSlash(target.Path, inboundPath)
		}

		if !strings.HasPrefix(inboundPath, "/") {
			inboundPath = "/" + inboundPath
		}
		req.URL.Path = inboundPath

		if corrID := req.Header.Get(middleware.CorrelationIDHeader); corrID != "" {
			req.Header.Set(middleware.CorrelationIDHeader, corrID)
		}

		clientIP := req.RemoteAddr
		if host, _, err := net.SplitHostPort(req.RemoteAddr); err == nil {
			clientIP = host
		}
		if prior := req.Header.Get("X-Forwarded-For"); prior != "" {
			clientIP = prior + ", " + clientIP
		}
		req.Header.Set("X-Forwarded-For", clientIP)
		req.Header.Set("X-Real-IP", clientIP)
	}
}
