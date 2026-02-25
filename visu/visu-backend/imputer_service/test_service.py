from flask import Flask, jsonify

app = Flask(__name__)

# TODO MOVE TO .env
SERVICE_NAME = "test_test"
PORT = 5151
DEBUG = True


@app.route('/health', methods=['GET'])
def ping():
    """
    health check
    """
    return jsonify({
        "status": "success",
        "message": "healthy",
        "service": SERVICE_NAME
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
