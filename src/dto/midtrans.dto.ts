import { ICustomerDetails, IExpiry, IItemDetails, IMidtransTransactionDetails } from "src/interfaces/midtrans.interface";

export class MidtransDto {
    transaction_details: IMidtransTransactionDetails;
    customer_details: ICustomerDetails;
    item_details: IItemDetails[];
    expiry: IExpiry
    enabled_payments?: string[];
}