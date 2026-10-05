import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppointmentLocationSection from "./AppointmentLocationSection.tsx";

describe("AppointmentLocationSection", () => {
    it("shows the address and a maps link", () => {
        render(
            <AppointmentLocationSection
                location={{
                    address: "Av. Providencia 1234, Santiago",
                    mapsUrl: "https://www.google.com/maps?q=-33.4,-70.6",
                }}
            />,
        );

        expect(screen.getByText("Av. Providencia 1234, Santiago")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver en Google Maps" })).toHaveAttribute(
            "href",
            "https://www.google.com/maps?q=-33.4,-70.6",
        );
    });

    it("renders nothing when there is no location data", () => {
        const { container } = render(<AppointmentLocationSection location={{}} />);
        expect(container).toBeEmptyDOMElement();
    });
});
