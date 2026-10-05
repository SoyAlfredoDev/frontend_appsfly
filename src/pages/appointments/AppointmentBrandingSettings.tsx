import { useRef } from "react";
import type { ChangeEvent } from "react";
import { FaImage, FaTimes, FaUpload } from "react-icons/fa";
import {
    APPOINTMENT_GALLERY_HINT,
    APPOINTMENT_GALLERY_MAX_IMAGES,
} from "../public/appointmentGallery.ts";
import {
    CLOUDINARY_FOLDERS,
    uploadImageToCloudinary,
} from "../../utils/cloudinaryUpload.js";

export type AppointmentBrandingState = {
    galleryImageUrls: string[];
    locationAddress: string;
    locationLatitude: string;
    locationLongitude: string;
};

export type PendingGalleryUpload = {
    index: number;
    file: File;
    previewUrl: string;
};

type AppointmentBrandingSettingsProps = {
    businessId?: string;
    value: AppointmentBrandingState;
    pendingUploads: PendingGalleryUpload[];
    onChange: (next: AppointmentBrandingState) => void;
    onPendingUploadsChange: (next: PendingGalleryUpload[]) => void;
};

function emptySlots(urls: string[]) {
    const next = [...urls];
    while (next.length < APPOINTMENT_GALLERY_MAX_IMAGES) next.push("");
    return next.slice(0, APPOINTMENT_GALLERY_MAX_IMAGES);
}

export async function uploadAppointmentGalleryImages(
    businessId: string,
    urls: string[],
    pendingUploads: PendingGalleryUpload[],
) {
    const nextUrls = emptySlots(urls);
    for (const pending of pendingUploads) {
        const uploadedUrl = await uploadImageToCloudinary(pending.file, {
            folder: CLOUDINARY_FOLDERS.APPOINTMENT_GALLERY,
            publicId: `appointment-gallery-${businessId}-${pending.index + 1}-${Date.now()}`,
        });
        if (uploadedUrl) nextUrls[pending.index] = uploadedUrl;
    }
    return nextUrls.filter(Boolean);
}

export function parseOptionalCoordinate(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

export default function AppointmentBrandingSettings({
    businessId,
    value,
    pendingUploads,
    onChange,
    onPendingUploadsChange,
}: AppointmentBrandingSettingsProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const activeSlotRef = useRef<number | null>(null);

    const slots = emptySlots(value.galleryImageUrls);

    const previewForSlot = (index: number) => {
        const pending = pendingUploads.find((item) => item.index === index);
        if (pending) return pending.previewUrl;
        return slots[index] || "";
    };

    const openFilePicker = (index: number) => {
        activeSlotRef.current = index;
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        const activeSlot = activeSlotRef.current;
        if (!file || activeSlot == null) return;

        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) return;

        const previewUrl = URL.createObjectURL(file);
        onPendingUploadsChange([
            ...pendingUploads.filter((item) => item.index !== activeSlot),
            { index: activeSlot, file, previewUrl },
        ]);
    };

    const removeSlot = (index: number) => {
        onPendingUploadsChange(pendingUploads.filter((item) => item.index !== index));
        const nextUrls = emptySlots(value.galleryImageUrls);
        nextUrls[index] = "";
        onChange({
            ...value,
            galleryImageUrls: nextUrls.filter(Boolean),
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Apariencia de tu página de citas</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Personaliza las fotos y la ubicación que verán tus clientes al agendar.
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FaImage aria-hidden="true" />
                    Fotos del local
                </div>
                <p className="text-xs text-slate-500">{APPOINTMENT_GALLERY_HINT}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {slots.map((url, index) => {
                        const preview = previewForSlot(index);
                        return (
                            <div
                                key={`gallery-slot-${index}`}
                                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3"
                            >
                                <div className="aspect-[3/2] overflow-hidden rounded-lg bg-white">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={`Vista previa foto ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-slate-400">
                                            <FaImage className="text-2xl" aria-hidden="true" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openFilePicker(index)}
                                        disabled={!businessId}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        <FaUpload aria-hidden="true" />
                                        {preview ? "Cambiar" : "Subir"}
                                    </button>
                                    {preview ? (
                                        <button
                                            type="button"
                                            onClick={() => removeSlot(index)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:text-red-600"
                                            aria-label={`Quitar foto ${index + 1}`}
                                        >
                                            <FaTimes aria-hidden="true" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-medium text-slate-700">Ubicación del local</h3>
                <label className="text-sm block">
                    <span className="font-medium text-slate-700">Dirección</span>
                    <input
                        type="text"
                        value={value.locationAddress}
                        onChange={(event) =>
                            onChange({ ...value, locationAddress: event.target.value })
                        }
                        placeholder="Ej: Av. Providencia 1234, Santiago"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        maxLength={300}
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                        Si la dejas vacía, usaremos la dirección de tu configuración general.
                    </span>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm block">
                        <span className="font-medium text-slate-700">Latitud (opcional)</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={value.locationLatitude}
                            onChange={(event) =>
                                onChange({ ...value, locationLatitude: event.target.value })
                            }
                            placeholder="-33.4489"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm block">
                        <span className="font-medium text-slate-700">Longitud (opcional)</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={value.locationLongitude}
                            onChange={(event) =>
                                onChange({ ...value, locationLongitude: event.target.value })
                            }
                            placeholder="-70.6693"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>
                </div>
                <p className="text-xs text-slate-500">
                    Las coordenadas son opcionales. Si las agregas, el mapa será más preciso.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
