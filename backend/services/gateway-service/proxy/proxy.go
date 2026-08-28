package proxy

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func Handler(targetURLStr string, pathPrefixToStrip string, pathPrefixToPrepend string) gin.HandlerFunc {
	target, err := url.Parse(targetURLStr)
	if err != nil {
		log.Fatalf("Invalid target URL for proxy: %s (%v)", targetURLStr, err)
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.Transport = SharedTransport
	proxy.FlushInterval = -1

	proxy.Director = NewDirector(target, proxy.Director, pathPrefixToStrip, pathPrefixToPrepend)
	proxy.ModifyResponse = func(response *http.Response) error {
		for _, header := range []string{
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Methods",
			"Access-Control-Expose-Headers",
			"Access-Control-Max-Age",
		} {
			response.Header.Del(header)
		}
		return nil
	}
	proxy.ErrorHandler = NewErrorHandler(targetURLStr)

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
