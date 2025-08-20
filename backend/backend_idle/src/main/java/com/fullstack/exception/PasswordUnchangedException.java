package com.fullstack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class PasswordUnchangedException extends RuntimeException {
    public PasswordUnchangedException(String message) {
        super(message);
    }
}
