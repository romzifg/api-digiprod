export const approvalStatusContant = {
    PENDING: 100,
    APPROVED: 200,
    REJECTED: 300,
}

export const approvalStatusLabel = {
    [approvalStatusContant.PENDING]: 'Pending',
    [approvalStatusContant.APPROVED]: 'Approved',
    [approvalStatusContant.REJECTED]: 'Rejected',
}

export const convertApprovalStatusToLabel = (status: number): string => {
    return approvalStatusLabel[status] || 'Unknown Status'
}