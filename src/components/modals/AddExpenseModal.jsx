import { useState, useRef } from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { v4 as uuidv4 } from 'uuid';
import InputFloatingComponent from '../inputs/InputFloatingComponent.jsx';
import { createExpense } from '../../api/expense.js'
import { Modal } from "bootstrap"

export default function AddExpenseModal() {
    // ----------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const [data, setData] = useState({
        expenseId: uuidv4(),
        expenseDescription: "",
        expensePaymentMethod: "2",
        expenseAmount: null,
        expenseDate: new Date().toISOString().split("T")[0],
        expenseImageUrl: null,
    });

    const [fileToUpload, setFileToUpload] = useState(null);
    const [loading, setLoading] = useState(false);
    const [btnModal, setBtnModal] = useState(false);
    const modalRef = useRef(null);

    // ----------------------------------------------------------------------
    // 2. HANDLERS FOR FORM INPUTS
    // ----------------------------------------------------------------------

    // Handler general para cualquier input o select que no sea el file
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    // Usaremos handleOnChange para todos los inputs y selects
    const handleInputOnChange = handleOnChange;

    // Handler para file selection
    const handleFileChange = (e) => {
        setFileToUpload(e.target.files[0]);
        setData((prev) => ({ ...prev, expenseImageUrl: "" }));
    };

    // ----------------------------------------------------------------------
    // 3. CLOUDINARY LOGIC
    // ----------------------------------------------------------------------
    const cloud_name = 'dtg53cua9'
    const upload_preset = 'appsfly'
    const temp_folder = 'expense_receipts';
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

            console.log(!response);

            if (!response) {
                throw new Error('Error al subir la imagen a Cloudinary');
            } else {
                const res = await response.json();
                console.log('Respuesta de Cloudinary:', res);
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
            // Asegúrate de enviar expenseAmount como número si el backend lo requiere
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
    const handleClickModal = async () => {
        setBtnModal(true);
        setLoading(true);
        try {
            // 1. VALIDATION
            if (data.expenseDescription.trim() === "" || data.expenseAmount <= 0) {
                alert("Por favor, complete la Descripción y el Monto.");
                return;
            };

            let imageUrl = "";

            // 2. CONDITIONAL IMAGE UPLOAD
            if (fileToUpload) {
                const uploadResult = await cloudinaryUpload();

                if (!uploadResult || !uploadResult.secure_url) {
                    alert("La subida de la imagen falló. Cancelando el envío del gasto.");
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
                alert("Gasto agregado exitosamente.");

                setData({
                    expenseId: uuidv4(),
                    expenseDescription: "",
                    expenseAmount: null,
                    expenseDate: new Date().toISOString().split("T")[0],
                    expensePaymentMethod: 1,
                    expenseImageUrl: ""
                });
                setFileToUpload(null);
                const modalEl = modalRef.current;
                if (modalEl) {
                    const modalInstance = Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }

                // 👇 Elimina el backdrop manualmente si Bootstrap no lo hace
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach((backdrop) => backdrop.remove());

                // 👇 Elimina la clase que bloquea el scroll
                document.body.classList.remove('modal-open');
                document.body.style.overflow = ''; // Rehabilita el scroll
            } else {
                alert("Error al agregar el gasto. Por favor, intente nuevamente.");

            };
        } catch (error) {
            console.error("Error general al procesar el gasto:", error);
            alert("Error al agregar el gasto. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
            setBtnModal(false);
        }
    };

    // ----------------------------------------------------------------------
    // 6. RENDER LOGIC
    // ----------------------------------------------------------------------
    const submitButtonText = loading ? 'Agregando...' : 'Agregar';

    return (
        <>
            {/* Modal Trigger Button */}
            <button
                type="button"
                className="btn btn-sm btn-success"
                data-bs-toggle="modal"
                data-bs-target="#modalAddExpense"
            >
                <i className="bi bi-plus-lg"></i>
                <span className="d-none d-md-inline-block fs-4"> Agregar</span>
            </button>

            <div
                className="modal fade"
                id="modalAddExpense"
                tabIndex="-1"
                aria-labelledby="modalAddExpenseLabel"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalAddExpenseLabel">Agregar Gasto</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">

                            {/* Primera Fila: Fecha y Método de Pago */}
                            <div className="row g-2 mb-3">
                                <div className="col-md-6">
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
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <select
                                            name="expensePaymentMethod"
                                            id="expensePaymentMethod"
                                            className="form-select"
                                            value={data.expensePaymentMethod}
                                            onChange={handleOnChange}
                                        >
                                            <option value="2">Efectivo</option>
                                            <option value="0">Tarjeta de Débito</option>
                                            <option value="1">Tarjeta de Crédito</option>
                                            <option value="3">Transferencia Bancaria</option>
                                        </select>
                                        <label htmlFor="expensePaymentMethod">Método de Pago</label>
                                    </div>
                                </div>
                            </div>

                            {/* Segunda Fila: Descripción y Monto */}
                            <div className="row g-2 mb-3">
                                <div className="col-9">
                                    <InputFloatingComponent
                                        label="Descripción del Gasto"
                                        type="text"
                                        name="expenseDescription"
                                        value={data.expenseDescription}
                                        onChange={handleInputOnChange}
                                    />
                                </div>
                                <div className="col-3">
                                    <InputFloatingComponent
                                        label="Monto"
                                        type="number"
                                        name="expenseAmount"
                                        value={data.expenseAmount}
                                        placeholder={0}
                                        onChange={handleInputOnChange}
                                        className="text-end"
                                    />
                                </div>
                            </div>

                            {/* Tercera Fila: Archivo de Imagen */}
                            <div className="row">
                                <div className="col-12">
                                    <label htmlFor="fileInput" className="form-label ms-1 mb-0">
                                        <small>Adjuntar comprobante (Opcional)</small>
                                    </label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="form-control"
                                        disabled={loading}
                                    />
                                    {/* Feedback for the user */}
                                    {fileToUpload && !loading && (
                                        <p className="text-muted mt-1">
                                            Archivo seleccionado: **{fileToUpload.name}**
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={btnModal || loading}
                                data-bs-dismiss="modal"
                                style={{ width: '130px' }}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={btnModal || loading}
                                onClick={handleClickModal}
                                style={{ width: '130px' }}
                            >
                                {submitButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}