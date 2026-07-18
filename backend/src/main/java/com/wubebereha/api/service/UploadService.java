package com.wubebereha.api.service;

import com.wubebereha.api.config.AppProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UploadService {

    private static final Set<String> ALLOWED_IMAGES = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<String> ALLOWED_ATTACHMENTS = Set.of("jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final Path uploadDir;

    public UploadService(AppProperties appProperties) {
        this.uploadDir = Path.of(appProperties.uploadDir());
    }

    public record UploadResult(String url, String originalName) {
    }

    public UploadResult saveUpload(MultipartFile file, Set<String> allowedExtensions, String prefix) {
        if (file == null || file.isEmpty()) {
            return new UploadResult(null, null);
        }

        String extension = extension(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File type ." + extension + " is not allowed");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must be 5 MB or smaller");
        }

        try {
            Files.createDirectories(uploadDir);
            String safeName = sanitize(file.getOriginalFilename());
            String storedName = prefix + "_" + UUID.randomUUID().toString().substring(0, 12) + "_" + safeName;
            Path destination = uploadDir.resolve(storedName);
            file.transferTo(destination);
            return new UploadResult("/uploads/" + storedName, safeName);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save upload");
        }
    }

    public UploadResult saveImage(MultipartFile file, String prefix) {
        return saveUpload(file, ALLOWED_IMAGES, prefix);
    }

    public UploadResult saveAttachment(MultipartFile file, String prefix) {
        return saveUpload(file, ALLOWED_ATTACHMENTS, prefix);
    }

    private static String extension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private static String sanitize(String filename) {
        if (filename == null) {
            return "file";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
