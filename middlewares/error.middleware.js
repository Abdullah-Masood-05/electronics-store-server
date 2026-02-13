const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId / CastError
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate value for field: ${field}`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // Firebase auth errors
    if (err.code && err.code.startsWith("auth/")) {
        statusCode = 401;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorHandler;
