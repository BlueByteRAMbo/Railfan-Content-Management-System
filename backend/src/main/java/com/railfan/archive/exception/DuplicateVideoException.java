package com.railfan.archive.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateVideoException extends RuntimeException {
    public DuplicateVideoException(String message) {
        super(message);
    }
}
