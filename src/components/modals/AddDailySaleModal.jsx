import { useEffect, useRef, useState } from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { v4 as uuidv4 } from 'uuid';
import { createDailySales } from "../../api/dailySales.js";

export default function AddDailySaleModal() {
    const [data, setData] = useState({});
    const [btnModal, setBtnModal] = useState(false);
    const modalRef = useRef(null);
    useEffect(() => {
        setData(
            { dailySalesDay: today(), dailySalesId: uuidv4() }
        )
    }, []);
    const today = () => new Date().toISOString().split("T")[0];
    const handleOnChange = (e) => setData((prevData) => ({ ...prevData, dailySalesDay: e.target.value }));
    const handleClickModal = async () => {
        try {
            setBtnModal(true);

            const res = await createDailySales(data);
            console.log('status code createDailySales:', res.status);

            if (res.status === 200 || res.status === 201) {
                alert(`Cierre diario agregado para la fecha: ${data.dailySalesDay}`);


                // Reinicia el formulario
                setData({ dailySalesDay: today(), dailySalesId: uuidv4() });
            } else {
                alert("Error al crear el cierre diario. Verifique los datos.");
                return;
            }
        } catch (error) {
            console.error("Error creating daily sale:", error);
            alert("Error al crear el cierre diario. Por favor, intente nuevamente.");
        } finally {
            setBtnModal(false); // 🔹 aseguras que siempre se reactivará el botón
        }
    };
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-success"
                data-bs-toggle="modal"
                data-bs-target="#modalAddDailySale"
            >
                <i className="bi bi-plus-lg"></i>
                <span className="d-none d-md-inline-block fs-4"> Agregar</span>
            </button>

            {/* Modal */}
            <div
                className="modal fade"
                id="modalAddDailySale"
                tabIndex="-1"
                aria-labelledby="modalAddDailySaleLabel"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalAddDailySaleLabel">Agregar Cierre Diario</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body input-group">
                            <input
                                type="date"
                                value={data.dailySalesDay}
                                onChange={handleOnChange}
                                className="form-control form-control-sm text-center"
                                style={{ width: "40%" }}
                            />
                        </div>

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
