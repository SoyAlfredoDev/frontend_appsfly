import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import { createExpense } from '../../api/expense.js'
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaCloudUploadAlt, FaFileImage } from "react-icons/fa";

export default function AddExpenseModal({ onExpenseAdded }) { // Added prop to notify parent on success
    // ----------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const [isOpen, setIsOpen] = useState(false); // Controls modal visibility

    const [data, setData] = useState({
        expenseId: uuidv4(),
        expenseDescription: "",
        expensePaymentMethod: "2",
        expenseAmount: "", // Changed to empty string for better input handling
        expenseDate: new Date().toISOString().split("T")[0],
        expenseImageUrl: null,
    });

    const [fileToUpload, setFileToUpload] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // ----------------------------------------------------------------------
    // 2. HANDLERS FOR FORM INPUTS
    // ----------------------------------------------------------------------

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileToUpload(file);
            setData((prev) => ({ ...prev, expenseImageUrl: "" }));
        }
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        if (!loading) {
            setIsOpen(false);
            // Optional: reset form on close or keep state? Usually reset on success.
        }
    };

    // ----------------------------------------------------------------------
    // 3. CLOUDINARY LOGIC
    // ----------------------------------------------------------------------
    const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const temp_folder = 'ticket_receipts';

    const upload_url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    const cloudinaryUpload = async () => {
        if (!fileToUpload) return null;
        const dataImgCloudinary = new FormData();
        dataImgCloudinary.append('file', fileToUpload);
        dataImgCloudinary.append('upload_preset', upload_preset);
        dataImgCloudinary.append('folder', temp_folder);

        const uniquePublicId = `photo-a0001-${data.expenseId}`;
        dataImgCloudinary.append('public_id', uniquePublicId);

        try {
            const response = await fetch(upload_url, {
                method: 'POST',
                body: dataImgCloudinary,
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen a Cloudinary');
            } else {
                const res = await response.json();
                setData((prev) => ({ ...prev, expenseImageUrl: res.secure_url }));
                return res;
            }

        } catch (error) {
            console.error('Error durante la subida:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
            return null;
        }
    };

    // ----------------------------------------------------------------------
    // 4. API CALL TO BACKEND
    // ----------------------------------------------------------------------
    const createExpenseFn = async (expenseData) => {
        try {
            const finalData = {
                ...expenseData,
                expenseAmount: parseFloat(expenseData.expenseAmount),
                expensePaymentMethod: parseInt(expenseData.expensePaymentMethod)
            };
            const res = await createExpense(finalData);
            return res;
        } catch (error) {
            console.error("Error al crear el gasto:", error);
            return { status: 500, message: "Error de API al crear el gasto" };
        };
    };

    // ----------------------------------------------------------------------
    // 5. MAIN SUBMISSION LOGIC
    // ----------------------------------------------------------------------
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. VALIDATION
            if (data.expenseDescription.trim() === "" || !data.expenseAmount || parseFloat(data.expenseAmount) <= 0) {
                alert("Por favor, complete la Descripción y el Monto.");
                setLoading(false);
                return;
            };

            let imageUrl = "";

            // 2. CONDITIONAL IMAGE UPLOAD
            if (fileToUpload) {
                const uploadResult = await cloudinaryUpload();

                if (!uploadResult || !uploadResult.secure_url) {
                    alert("La subida de la imagen falló. Cancelando el envío del gasto.");
                    setLoading(false);
                    return;
                }
                imageUrl = uploadResult.secure_url;
            }

            // 3. FINAL DATA PREPARATION & SEND TO BACKEND
            const dataFinal = {
                ...data,
                expenseImageUrl: imageUrl
            };

            const res = await createExpenseFn(dataFinal);

            if (res && res.status === 201) {
                // Success
                alert("Gasto agregado exitosamente.");
                
                // Reset form
                setData({
                    expenseId: uuidv4(),
                    expenseDescription: "",
                    expensePaymentMethod: "2",
                    expenseAmount: "",
                    expenseDate: new Date().toISOString().split("T")[0],
                    expenseImageUrl: null
                });
                setFileToUpload(null);
                setIsOpen(false);
                
                // Notify parent to refresh list
                if (onExpenseAdded) onExpenseAdded();

            } else {
                alert("Error al agregar el gasto. Por favor, intente nuevamente.");
            };
        } catch (error) {
            console.error("Error general al procesar el gasto:", error);
            alert("Error al agregar el gasto. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const submitButtonText = loading ? 'Guardando...' : 'Guardar Gasto';

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
            >
                <FaPlus /> Agregar Gasto
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        
                        {/* Modal Content */}
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800">Registrar Nuevo Gasto</h3>
                                <button 
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Fila 1: Fecha y Método de Pago */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputFloatingComponent
                                            label="Fecha del Gasto"
                                            type="date"
                                            name="expenseDate"
                                            value={data.expenseDate}
                                            onChange={handleOnChange}
                                            disabled={true}
                                            readOnly={true}
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            name="expensePaymentMethod"
                                            id="expensePaymentMethod"
                                            className="block px-3 pb-2 pt-4 w-full text-sm text-slate-800 bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-0 focus:border-green-600 peer transition-colors"
                                            value={data.expensePaymentMethod}
                                            onChange={handleOnChange}
                                        >
                                            <option value="2">Efectivo</option>
                                            <option value="0">Tarjeta de Débito</option>
                                            <option value="1">Tarjeta de Crédito</option>
                                            <option value="3">Transferencia Bancaria</option>
                                        </select>
                                        <label
                                            htmlFor="expensePaymentMethod"
                                            className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] start-3 peer-focus:text-green-700 pointer-events-none select-none"
                                        >
                                            Método de Pago
                                        </label>
                                    </div>
                                </div>

                                {/* Fila 2: Descripción y Monto */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-3">
                                        <InputFloatingComponent
                                            label="Descripción del Gasto"
                                            type="text"
                                            name="expenseDescription"
                                            value={data.expenseDescription}
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                    <div>
                                        <InputFloatingComponent
                                            label="Monto"
                                            type="number"
                                            name="expenseAmount"
                                            value={data.expenseAmount}
                                            placeholder="0"
                                            onChange={handleOnChange}
                                        />
                                    </div>
                                </div>

                                {/* Fila 3: Archivo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comprobante (Opcional)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300 border-dashed">
                                            <FaCloudUploadAlt className="text-lg" />
                                            <span className="text-sm">Seleccionar archivo</span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={loading}
                                            />
                                        </label>
                                        {fileToUpload && (
                                            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                <FaFileImage />
                                                <span className="truncate max-w-[200px]">{fileToUpload.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>}
                                    {submitButtonText}
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}