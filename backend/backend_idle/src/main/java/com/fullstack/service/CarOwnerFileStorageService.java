package com.fullstack.service;

import org.springframework.web.multipart.MultipartFile;

public interface CarOwnerFileStorageService {
	String storeAvatar(String ownerId, MultipartFile file);
}
