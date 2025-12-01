import AddTicketModal from "../../components/modals/AddTicketModal.jsx";
import NavBarComponent from "../../components/NavBarComponent";
import ProtectedView from "../../components/ProtectedView";
import SectionHeader from "../../components/SetionHeader.jsx";

export default function SupportPage() {
    return (
        <ProtectedView>
            <NavBarComponent />
            <div className="container-fluid" style={{ marginTop: '80px' }}>
                <SectionHeader
                    title="Soporte y ticket de ayuda"
                    button={<AddTicketModal />}
                    placeholderInputSearch="Buscar ticket..."
                    globalFilter={""}
                    setGlobalFilter={() => { }}
                />

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Numero Ticke</th>
                                <th>Fecha de creacion</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>12345</td>
                                <td>2024-06-15</td>
                                <td>Open</td>
                            </tr>
                            <tr>
                                <td>67890</td>
                                <td>2024-06-10</td>
                                <td>Closed</td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>
        </ProtectedView>
    );
}