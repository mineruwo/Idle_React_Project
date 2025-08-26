
/*package com.fullstack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(PasswordUnchangedException.class)
    public ResponseEntity<String> handlePasswordUnchanged(PasswordUnchangedException ex) {
        return ResponseEntity
        		.status(HttpStatus.UNPROCESSABLE_ENTITY)
        		.body(ex.getMessage());
    }
}
*/