
const errorHandler = (response, error) => {
    response.status(500).json({
        success: false,
        message: error.message ? error.message : error
    })
}

module.exports = { errorHandler }