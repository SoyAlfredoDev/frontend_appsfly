import { describe, expect, it } from "vitest";
import {
    DEFAULT_APPOINTMENT_GALLERY_IMAGE,
    resolveGalleryImages,
} from "./appointmentGallery.ts";

describe("resolveGalleryImages", () => {
    it("returns the default image when no urls are configured", () => {
        expect(resolveGalleryImages([])).toEqual([DEFAULT_APPOINTMENT_GALLERY_IMAGE]);
        expect(resolveGalleryImages(null)).toEqual([DEFAULT_APPOINTMENT_GALLERY_IMAGE]);
    });

    it("keeps up to three configured urls", () => {
        const urls = [
            "https://cdn.example.com/1.jpg",
            "https://cdn.example.com/2.jpg",
            "https://cdn.example.com/3.jpg",
            "https://cdn.example.com/4.jpg",
        ];
        expect(resolveGalleryImages(urls)).toEqual(urls.slice(0, 3));
    });
});
