package com.musicstream.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.musicstream.config.StorageProperties;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    private final Path rootLocation;

    @Autowired
    public StorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("audio"));
            Files.createDirectories(rootLocation.resolve("images"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String storeAudioFile(MultipartFile file) {
        return storeFile(file, "audio");
    }

    public String storeImageFile(MultipartFile file) {
        return storeFile(file, "images");
    }

    private String storeFile(MultipartFile file, String subDirectory) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            if (originalFilename.contains("..")) {
                throw new RuntimeException("Cannot store file with relative path outside current directory");
            }

            String extension = getFileExtension(originalFilename);

            if (subDirectory.equals("audio") && !isValidAudioFormat(extension)) {
                throw new RuntimeException("Invalid audio format. Allowed: MP3, WAV, OGG");
            }

            if (subDirectory.equals("images") && !isValidImageFormat(extension)) {
                throw new RuntimeException("Invalid image format. Allowed: JPG, JPEG, PNG, GIF, WEBP");
            }

            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path destinationFile = this.rootLocation.resolve(subDirectory)
                    .resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.resolve(subDirectory).toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + subDirectory + "/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        try {
            String relativePath = filePath.replace("/uploads/", "");
            Path file = rootLocation.resolve(relativePath);

            Files.deleteIfExists(file);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + filePath + " - " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }

        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1) {
            return "";
        }

        return filename.substring(lastDot + 1).toLowerCase();
    }

    private boolean isValidAudioFormat(String extension) {
        return extension.equals("mp3") ||
                extension.equals("wav") ||
                extension.equals("ogg");
    }

    private boolean isValidImageFormat(String extension) {
        return extension.equals("jpg") ||
                extension.equals("jpeg") ||
                extension.equals("png") ||
                extension.equals("gif") ||
                extension.equals("webp"); // Support WebP comme demandé dans le frontend
    }
}