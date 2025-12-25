import React from "react";
import { Button } from "react-bootstrap";
import { MenuItem } from "../../types/MenuItem";
import { OrderItem } from "../../types/Order";

interface Props {
    onPrintKot?: () => void;
    onTransfer?: () => void;
    onMerge?: () => void;
    onCloseBill?: () => void;
    confirmCloseBill?: () => void;
    kotItems?: OrderItem[];
    disablePrintKot?: boolean;
    disableCloseBill?: boolean;
    disableTransfer?: boolean;
    disableMerge?: boolean;
    existingItems?: OrderItem[];
    showCloseBill?: boolean;
    selectedMethod?: "cash" | "upi" | "card" | null;
}

const DrawerActions: React.FC<Props> = ({
    onPrintKot,
    onTransfer,
    onMerge,
    onCloseBill,
    confirmCloseBill,
    kotItems,
    disablePrintKot,
    disableCloseBill,
    disableTransfer,
    disableMerge,
    existingItems,
    showCloseBill,
    selectedMethod
}) => {
    return (
        <>
            {(
                (existingItems && existingItems.length > 0) ||
                (kotItems && kotItems.length > 0)
            ) && (
                    <div className="drawer-actions p-0">
                        <div className="action-grid d-flex gap-3">
                            {!showCloseBill ? (
                                <Button
                                    variant="danger"
                                    className={`btn btn-danger ${kotItems && kotItems.length > 0 ? 'w-50' : 'w-100'}`}
                                    onClick={onCloseBill}
                                    disabled={disableCloseBill}
                                >
                                    Close Bill
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    className={`btn btn-success ${kotItems && kotItems.length > 0 ? 'w-50' : 'w-100'}`}
                                    onClick={confirmCloseBill}
                                    disabled={!selectedMethod}
                                >
                                    Confirm & Mark as Paid
                                </Button>
                            )}

                            {kotItems && kotItems.length > 0 && (
                                <Button variant="warning" onClick={onPrintKot} className="btn btn-warning w-50" disabled={disablePrintKot}>
                                    <i className="bi bi-printer me-2" />
                                    Print KOT
                                </Button>
                            )}
                        </div>
                        {!showCloseBill && (
                            <div className="action-grid d-flex gap-3">
                                <Button variant="outline-secondary" onClick={onTransfer} className="btn btn-outline-secondary w-50" disabled={disableTransfer}>
                                    <i className="bi bi-arrow-left-right me-2" />
                                    Transfer Table
                                </Button>

                                <Button variant="outline-secondary" onClick={onMerge} className="btn btn-outline-secondary w-50" disabled={disableMerge}>
                                    <i className="bi bi-layers me-2" />
                                    Merge Table
                                </Button>
                            </div>
                        )}
                    </div>
                )}
        </>
    );
};

export default DrawerActions;
