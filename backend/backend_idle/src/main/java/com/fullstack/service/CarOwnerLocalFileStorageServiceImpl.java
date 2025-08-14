package com.fullstack.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CarOwnerLocalFileStorageServiceImpl implements CarOwnerFileStorageService {

    @Value("${app.upload.avatar-dir}")
    private String avatarDir; // 예: ./uploads/avatars/

    @Override
    public String storeAvatar(String ownerId, MultipartFile file) {
        try {
            if (file.isEmpty()) throw new IllegalArgumentException("EMPTY_FILE");

            String ext = getExt(file.getOriginalFilename());
            if (!isAllowed(ext)) throw new IllegalArgumentException("UNSUPPORTED_TYPE");

            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String filename = ownerId + "_" + ts + ext;

            Path dir = Paths.get(avatarDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path dest = dir.resolve(filename).normalize();

            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

            // /uploads/**
            return "/uploads/avatars/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("FILE_SAVE_FAILED", e);
        }
    }

    private String getExt(String name) {
        String ext = StringUtils.getFilenameExtension(name);
        return (ext != null && !ext.isBlank()) ? "." + ext.toLowerCase() : "";
    }

    private boolean isAllowed(String ext) {
        return ".png".equals(ext) || ".jpg".equals(ext)
            || ".jpeg".equals(ext) || ".webp".equals(ext);
    }
}