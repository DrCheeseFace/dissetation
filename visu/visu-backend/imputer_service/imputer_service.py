
from flask import Flask, jsonify, request
from http import HTTPStatus
import os
import info
import simple_imputer

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


@app.route('/get_missiG_info', methods=['GET'])
def get_missiG_info():
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
        "info": info.get_missiG_info(file_path),
        "message": "success"
    }), HTTPStatus.OK


@app.route('/simple_impute', methods=['POST'])
def simple_impute():
    """
    perform simple imputation

    Input JSON: {
        "src": "path/to/src_data.csv",
        "dst": "path/to/dst_data.csv",
        "feature": "feature_to_impute",
        "strategy":  "mean|median|mode"
    }

    :return: status
    """
    data = request.get_json()

    required_keys = ['src', 'dst', 'feature', 'strategy']
    if not data or not all(key in data for key in required_keys):
        return jsonify({
            "status": "error",
            "message": f"Missing required JSON fields. Expected: {required_keys}"
        }), HTTPStatus.BAD_REQUEST

    src = "../" + data['src']
    dst = "../" + data['dst']
    feature = data['feature']
    strategy = data['strategy']

    if not os.path.exists(src):
        return jsonify({
            "status": "error",
            "message": f"File not found at: {src}"
        }), HTTPStatus.NOT_FOUND

    try:
        simple_imputer.simple_imputer_service(src, dst, feature, strategy)

        return jsonify({
            "status": "success",
            "message": "success"
        }), HTTPStatus.OK

    except (KeyError, ValueError, TypeError) as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), HTTPStatus.BAD_REQUEST

    except RuntimeError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), HTTPStatus.INTERNAL_SERVER_ERROR

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An unexpected server error occurred.{e}"
        }), HTTPStatus.INTERNAL_SERVER_ERROR


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
