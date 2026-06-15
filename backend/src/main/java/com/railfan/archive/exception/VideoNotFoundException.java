package com.railfan.archive.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VideoNotFoundException extends RuntimeException {
    public VideoNotFoundException(Long id) {
        super("Video not found with id: " + id);
    }
    public VideoNotFoundException(String message) {
        super(message);
    }
}
