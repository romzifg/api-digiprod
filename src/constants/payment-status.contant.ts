export const paymentStatusContant = {
    PENDING: 100,
    SETTLEMENT: 200,
    EXPIRED: 300,
}

export const paymentStatusStringConstant = {
    PENDING: 'pending',
    SETTLEMENT: 'settlement',
    EXPIRED: 'expired',
}

export const getPaymentStatus = (status: string): number => {
    switch (status.toLowerCase()) {
        case 'pending':
            return paymentStatusContant.PENDING
        case 'settlement':
            return paymentStatusContant.SETTLEMENT
        case 'expired':
            return paymentStatusContant.EXPIRED
        default:
            throw new Error('Invalid payment status')
    }
}