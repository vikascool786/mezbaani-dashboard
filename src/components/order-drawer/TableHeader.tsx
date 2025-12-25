import React from "react";
import { Badge } from "react-bootstrap";
import { Order } from "../../types/Order";
import { getElapsedTime } from "../../utils/time";
// import { Order } from "../../types/Order";
// import { getElapsedTime } from "../../utils/time";
// import "./css/TableHeader.css";

const statusMap = {
    OPEN: { label: "In Dining", className: "dining" },
    CLOSED: { label: "Billed", className: "billed" },
    CANCELLED: { label: "Cancelled", className: "cancelled" },
};
interface Props {
    onClose?: () => void;
    orderDetails?: Order | null;
}

const TableHeader: React.FC<Props> = ({ onClose, orderDetails }) => {

    return (
        <div className="table-header-drawer">
            {/* Top row */}
            <div>
                <div className="align-content-lg-start d-flex gap-3 justify-content-between">
                    <div>
                        <h5 className="d-flex fw-bold mb-1">
                            #{orderDetails?.orderNumber}                            
                            <span className="d-flex fw-normal gst-percent ms-3 text-muted">
                                <Badge className={`badge bg-primary billed d-flex table-header-drawer-status-pill`}>
                                    <span className="dot" />
                                    {orderDetails?.status === 'CLOSED' ? 'Closed' : 'Dine In'}
                                </Badge>
                            </span>
                        </h5>
                        <div className="order-details-lagend">
                            <div className="order-details-section">
                                <div className="order-details-section-title">Table</div>
                                    <div className="order-details-section-description"><i className="bi bi-fork-knife me-1"></i>{orderDetails?.Table?.name} ({orderDetails?.status === 'CLOSED' ? 'Closed' : 'Dine In'})</div>
                                </div>
                            <div className="order-details-section">
                                <div className="order-details-section-title ">Server</div>
                                <div className="order-details-section-description"><i className="bi bi-person me-1"></i> {orderDetails?.user?.name}</div>
                            </div>
                            <div className="order-details-section">
                                <div className="order-details-section-title ">Placed</div>
                                <div className="order-details-section-description"><i className="bi bi-clock me-1"></i> {getElapsedTime(orderDetails?.openedAt as string)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="btn btn-close" onClick={onClose}
                        aria-label="Close">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableHeader;
