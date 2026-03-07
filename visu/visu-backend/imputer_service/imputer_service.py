
from flask import Flask, jsonify, request
from http import HTTPStatus
import os
import info

app = Flask(__name__)

# TODO MOVE TO .env
SERVICE_NAME = "imputer_service"
PORT = 8008
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


@app.route('/summary', methods=['GET'])
def get_unimputed_data_summary():
    """
    get statistics on a given unimputed dataset provided via JSON body.

    Input JSON: {"file_path": "path/to/data.csv"}
    :return: statistics on a given unimputed dataset
    """
    data = request.get_json()

    if not data or 'file_path' not in data:
        return jsonify({
            "status": "error",
            "message": "No file_path provided in JSON body"
        }), HTTPStatus.BAD_REQUEST

    file_path = "../" + data['file_path']

    if not os.path.exists(file_path):
        return jsonify({
            "status": "error",
            "message": f"File not found at: {file_path}"
        }), HTTPStatus.NOT_FOUND

    return jsonify({
        "status": "success",
        "info": info.get_unimputed_dataset_info(file_path),
        "message": "success"
    }), HTTPStatus.OK


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
