package com.pms.backend.exception;

public class DuplicateRollNumberException extends RuntimeException {
    public DuplicateRollNumberException(String message) {
        super(message);
    }
}
