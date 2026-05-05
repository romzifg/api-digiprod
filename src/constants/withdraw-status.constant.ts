export const withdrawStatusConstant = {
    PENDING: 100,
    APPROVED: 200,
    REJECTED: 300
}

export const withdrawStatusStringConstant = {
    PENDING: 'Process',
    APPROVED: 'Success transfer',
    REJECTED: 'Failed transfer'
}

export const getWithdrawStatusLabel = (status: string): number => {
    switch (status.toLowerCase()) {
        case 'pending':
            return withdrawStatusConstant.PENDING
        case 'approved':
            return withdrawStatusConstant.APPROVED
        case 'rejected':
            return withdrawStatusConstant.REJECTED
        default:
            throw new Error('Invalid withdraw status')
    }
}