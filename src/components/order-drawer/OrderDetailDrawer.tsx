import React, { useEffect, useState, useMemo, useRef } from "react";
import TableHeader from "./TableHeader";
import { useApi } from "../../hooks/useApi";
import "./css/OrderDetailDrawer.css";
import { Order, OrderItem } from "../../types/Order";
import OrderItems from "../table-order-drawer/OrderItems";
import BillSummary from "../table-order-drawer/BillSummary";

interface Props {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onOrderUpdated?: (tableId: string) => void;
}

const TableOrderDrawer: React.FC<Props> = ({ order, isOpen, onClose, onOrderUpdated }) => {
    const { apiCall } = useApi();
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState<Order | null>(order);
    const [existingItems, setExistingItems] = useState<OrderItem[]>([]);

    // fetch orders
    useEffect(() => {
        if (!isOpen) return;

        const fetchOrderById = async () => {
            try {
                if (order?.id === undefined) return;

                setOrderLoading(true);

                const res = await apiCall(`${baseUrl}/orders/${order?.id}`);
                const orders = res || [];

                setOrderDetails(orders);
                setExistingItems(orders.items || []);

            } catch (err) {
                console.error("Failed to load order details", err);
            } finally {
                setOrderLoading(false);
            }
        };

        fetchOrderById();
    }, [isOpen, order?.id]);

    if (!isOpen) return null;

    return (
        <>
            {/* HEADER */}
            <div className="drawer-header">
                <TableHeader onClose={onClose} orderDetails={orderDetails} />
            </div>

            <div className="sidebar-wrapper-main">
                <aside className="drawer-root w-100">
                    <div className="drawer-content p-0">
                        <div className="border-bottom section-title">ORDER HISTORY</div>
                        <div className="drawer-items p-3">
                            {existingItems.length > 0 && (
                                <>
                                    <div className="section-title"><i className="bi bi-fork-knife"></i> ORDER ITEMS</div>
                                    <OrderItems items={existingItems} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="drawer-footer">
                        {orderDetails && (
                            <div className="drawer-bill">
                                <BillSummary
                                    bill={{
                                        subtotal: Number(orderDetails?.subtotal || 0),
                                        gst: Number(orderDetails?.taxAmount || 0),
                                        gstPercent: Number(orderDetails?.gstPercent || 0),
                                        serviceCharge: Number(orderDetails?.serviceCharge || 0),
                                        total: Number(orderDetails?.total || 0),
                                    }}
                                />
                            </div>
                        )}
                        <div className="drawer-actions">
                            <div className="drawer-actions p-0">
                                <div className="action-grid d-flex gap-3">
                                    <button type="button" className="btn btn-danger fs-5 fw-semibold w-100">
                                        <i className="bi bi-printer me-2"></i>
                                        Print Bill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

        </>
    );
};

export default TableOrderDrawer;
