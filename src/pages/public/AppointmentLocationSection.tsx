import { FaMapMarkerAlt } from "react-icons/fa";

export type AppointmentLocation = {
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    mapsUrl?: string | null;
};

type AppointmentLocationSectionProps = {
    location?: AppointmentLocation | null;
    compact?: boolean;
};

function buildEmbedUrl(location: AppointmentLocation) {
    const { address, latitude, longitude } = location;
    if (latitude != null && longitude != null) {
        const delta = 0.01;
        const bbox = [
            longitude - delta,
            latitude - delta,
            longitude + delta,
            latitude + delta,
        ].join(",");
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
    }
    if (address) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
    }
    return null;
}

export default function AppointmentLocationSection({
    location,
    compact = false,
}: AppointmentLocationSectionProps) {
    if (!location?.address && location?.latitude == null) return null;

    const embedUrl = buildEmbedUrl(location);

    return (
        <section className={compact ? "space-y-2" : "space-y-3"} aria-label="Ubicación del local">
            {location.address ? (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                    <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#0c7a4e]" aria-hidden="true" />
                    <div>
                        <p className="font-medium text-dark">{location.address}</p>
                        {location.mapsUrl ? (
                            <a
                                href={location.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-block text-[#0c7a4e] no-underline hover:underline"
                            >
                                Ver en Google Maps
                            </a>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {embedUrl && !compact ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <iframe
                        title="Mapa del local"
                        src={embedUrl}
                        className="h-40 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            ) : null}
        </section>
    );
}
