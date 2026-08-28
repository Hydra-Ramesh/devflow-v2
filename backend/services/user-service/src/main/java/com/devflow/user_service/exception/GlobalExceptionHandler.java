package com.devflow.user_service.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private String extractTraceId(HttpServletRequest request) {
        String traceId = request.getHeader("X-Correlation-ID");
        return traceId != null ? traceId : "N/A";
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        log.warn("[{}] ResponseStatusException: {} {}", extractTraceId(request), ex.getStatusCode(), ex.getReason());

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .status("error")
                .message(ex.getReason() != null ? ex.getReason() : ex.getMessage())
                .traceId(extractTraceId(request))
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        log.warn("[{}] Validation error: {}", extractTraceId(request), errors);

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .status("error")
                .message("Invalid request payload")
                .error(errors)
                .traceId(extractTraceId(request))
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({AuthenticationException.class, AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleAuthException(Exception ex, HttpServletRequest request) {
        log.warn("[{}] Auth exception: {}", extractTraceId(request), ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .status("error")
                .message("Unauthorized: " + ex.getMessage())
                .traceId(extractTraceId(request))
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("[{}] Uncaught internal error: {}", extractTraceId(request), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .status("error")
                .message("Internal server error. Please try again later.")
                .traceId(extractTraceId(request))
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
