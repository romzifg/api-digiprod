export interface IMidtransResponse {
    token: string;
    redirect_url: string;
}

export interface IMidtransRequest {
    transaction_details: IMidtransTransactionDetails;
    customer_details: ICustomerDetails;
    item_details: IItemDetails[];
    expiry: IExpiry;
    enabled_payments?: string[];
}

export interface IMidtransTransactionDetails {
    order_id: string;
    gross_amount: number;
}

export interface ICustomerDetails {
    first_name: string;
    email: string;
    phone: string;
}

export interface IItemDetails {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface IExpiry {
    unit: 'day' | 'hour' | 'minute' | 'second';
    duration: number;
}