import React, {useEffect, useState} from 'react';
import {collection, doc, getDocs, query, updateDoc} from 'firebase/firestore';
import {db} from "src/firebase";
import "/src/app/courierPortal/updateorderstatus.css";

const UpdateOrderStatus = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [newStatus, setNewStatus] = useState("courier-assigned");

    useEffect(() => {
        const fetchOrders = async () => {
            // Creating a query that selects only orders without the 'not-paid' status
            const q = query(collection(db, "orders"));
            const querySnapshot = await getDocs(q);
            const ordersData = querySnapshot.docs
                .map(doc => ({id: doc.id, ...doc.data()}))
                .filter(order => order.status !== "not-paid" && order.status !== "package-delivered");
            setOrders(ordersData);
        };

        fetchOrders();
    }, []);

    const updateStatus = async () => {
        if (selectedOrderId) {
            const docRef = doc(db, 'orders', selectedOrderId);
            await updateDoc(docRef, {status: newStatus});
            if (newStatus === 'courier-assigned') {
                await updateDoc(docRef, {courierUID: window.localStorage.getItem('userUID')});
                await updateDoc(docRef, {courierName: window.localStorage.getItem('username')});
            }
            alert(`Order ${selectedOrderId} updated to status ${newStatus}`);
        } else {
            alert('Please select an order');
        }
    };

    return (
        <div className='update-order-status z-[20]'>
            <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">Select an Order</option>
                {orders.map(order => (
                    <option key={order.id} value={order.id}>
                        {order.id} - {order.customerUsername} {/* Displaying order ID and customer name */}
                    </option>
                ))}
            </select>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="courier-assigned">Courier Assigned</option>
                <option value="package-picked-up">Package Picked Up</option>
                <option value="package-delivered">Package Delivered</option>
            </select>
            <button onClick={updateStatus}>Update Status</button>
        </div>
    );
};

export default UpdateOrderStatus;
