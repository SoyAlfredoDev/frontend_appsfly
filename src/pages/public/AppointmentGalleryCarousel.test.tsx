import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppointmentGalleryCarousel from "./AppointmentGalleryCarousel.tsx";
import { DEFAULT_APPOINTMENT_GALLERY_IMAGE } from "./appointmentGallery.ts";

describe("AppointmentGalleryCarousel", () => {
    it("shows the default image when the business has no gallery", () => {
        render(<AppointmentGalleryCarousel alt="Local" className="h-40" />);
        expect(screen.getByRole("img", { name: "Local" })).toHaveAttribute(
            "src",
            DEFAULT_APPOINTMENT_GALLERY_IMAGE,
        );
    });

    it("renders configured gallery images", () => {
        render(
            <AppointmentGalleryCarousel
                imageUrls={["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"]}
                alt="Óptica Norte"
            />,
        );
        expect(screen.getByRole("img", { name: "Óptica Norte" })).toHaveAttribute(
            "src",
            "https://cdn.example.com/a.jpg",
        );
    });
});
