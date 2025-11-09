import { useEffect, useRef, useState } from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { v4 as uuidv4 } from 'uuid';
import { createTransaction } from "../../api/transaction";
import "./StaticModals.css";
import InputFloatingComponent from "../inputs/InputFloatingComponent.jsx";

export default function AddTransactionModal() {
    const transactionId = uuidv4();
    const [data, setData] = useState({
        transactionId: transactionId,
        transactionDate: new Date(),
        transactionType: 'ADJUSTMENT',
        transactionMethod: 0,
        transactionTable: null,
        transactionRecordId: transactionId,
        transactionOldValue: null,
        transactionNewValue: 100000,
        transactionDescription: null,
    });
    const [btnModal, setBtnModal] = useState(false);
    const modalRef = useRef(null);
    useEffect(() => {
        setData(
            { dailySalesDay: today(), dailySalesId: uuidv4() }
        )
    }, []);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const today = () => new Date().toISOString().split("T")[0];
    const handleClickModal = async () => {
        try {
            setBtnModal(true);
            const res = await createTransaction(data);
            if (res.status === 200 || res.status === 201) {
                alert(`Transacción agregada para la fecha: ${data.dailySalesDay}`);
            }
        } catch (error) {
            console.error("Error creating daily sale:", error);
            alert("Error al crear el cierre diario. Por favor, intente nuevamente.");
        } finally {
            setBtnModal(false); // 🔹 aseguras que siempre se reactivará el botón
        }
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with data:");
    }
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-success"
                data-bs-toggle="modal"
                data-bs-target="#modalAddTransaction"
            >
                <i className="bi bi-plus-lg"></i>
                <span className="d-none d-md-inline-block fs-4"> Agregar</span>
            </button>

            {/* Modal */}
            <div
                className="modal fade"
                id="modalAddTransaction"
                tabIndex="-1"
                aria-labelledby="modalAddTransactionLabel"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content custom-modal">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalAddTransactionLabel">Agregar Transacción</h5>
                            <button type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close">
                            </button>
                        </div>

                        <form onSubmit={handleOnSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <InputFloatingComponent
                                            label="Fecha"
                                            type="date"
                                            name="transactionDate"
                                            value={data.transactionDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <select
                                                className="form-select"
                                                name="transactionType"
                                                id="transactionType"
                                                disabled>
                                                <option value="ADJUSTMENT">Ajuste</option>
                                            </select>
                                            <label htmlFor="transactionType">Tipo de Transacción</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <select
                                                className="form-select"
                                                name="transactionMethod"
                                                id="transactionMethod">
                                                <option value="0">Tarjeta de Débito</option>
                                                <option value="1">Tarjeta de Crédito</option>
                                                <option value="2">Efectivo</option>
                                                <option value="3">Transferencia Bancaria</option>
                                            </select>
                                            <label htmlFor="transactionMethod">Método de Transacción</label>

                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <InputFloatingComponent
                                            label="Monto"
                                            type="number"
                                            name="transactionNewValue"
                                            value={data.transactionNewValue}
                                            onChange={handleInputChange}

                                        />
                                    </div>
                                </div>


                                <InputFloatingComponent
                                    label="Descripción"
                                    type="text"
                                    name="transactionDescription"
                                    value={data.transactionDescription}
                                    onChange={handleInputChange}

                                />

                            </div>
                        </form>



                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={btnModal}
                                data-bs-dismiss="modal"
                                style={{ width: '120px' }}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={btnModal}
                                onClick={handleClickModal}
                                data-bs-dismiss="modal"
                                style={{ width: '120px' }}
                            >
                                Agregar
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
