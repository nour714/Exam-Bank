/**
 * Consistent JSON response helpers
 */

export function successResponse(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

export function errorResponse(res, message = "Server error", statusCode = 500, errors = []) {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
}

export function paginatedResponse(res, data, total, page, limit, message = "Success") {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}
