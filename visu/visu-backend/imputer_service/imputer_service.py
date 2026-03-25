
from flask import Flask, jsonify, request
from http import HTTPStatus
import os
import info
import simple_imputer
import knn_imputer

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


@app.route('/missiG_info', methods=['GET'])
def get_missiG_info():
    """
    get statistics on a given unimputed dataset provided via JSON body.

    Input params: {"file_path": "path/to/data.csv"}
    :return: statistics on a given unimputed dataset
    """

    file_path_param = request.args.get('file_path')

    if not file_path_param:
        return jsonify({
            "status": "error",
            "message": "No file_path provided in URL parameters"
        }), HTTPStatus.BAD_REQUEST

    file_path = "../" + file_path_param

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


@app.route('/basic_info', methods=['GET'])
def get_basic_info():
    """
    get basic info

    Input params: {"file_path": "path/to/data.csv"}
    :return: statistics on a given unimputed dataset
    """
    file_path_param = request.args.get('file_path')

    if not file_path_param:
        return jsonify({
            "status": "error",
            "message": "No file_path provided in URL parameters"
        }), HTTPStatus.BAD_REQUEST

    file_path = "../" + file_path_param

    if not os.path.exists(file_path):
        return jsonify({
            "status": "error",
            "message": f"File not found at: {file_path}"
        }), HTTPStatus.NOT_FOUND

    try:
        basic_info = info.get_basic_info(file_path)
        return jsonify(basic_info), HTTPStatus.OK

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
            "message": f"Missing required JSON fields. Expected: {
                required_keys}"
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


@app.route('/knn_impute', methods=['POST'])
def knn_impute():
    """
    perform simple imputation

    Input JSON: {
        "src":          str
        "dst":          str
        "n_neighbors":  int
    }

    :return: status
    """
    data = request.get_json()

    required_keys = ['src', 'dst', 'n_neighbors']
    if not data or not all(key in data for key in required_keys):
        return jsonify({
            "status": "error",
            "message": f"Missing required JSON fields. Expected: {
                required_keys}"
        }), HTTPStatus.BAD_REQUEST

    src = "../" + data['src']
    dst = "../" + data['dst']
    n_neighbors = data['n_neighbors']

    if not os.path.exists(src):
        return jsonify({
            "status": "error",
            "message": f"File not found at: {src}"
        }), HTTPStatus.NOT_FOUND

    try:
        knn_imputer.knn_imputer_service(src, dst, n_neighbors)

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


@app.route('/sample', methods=['GET'])
def get_sample():
    """
    get sample

    Input params: {
        "src": "path/to/data.csv",
        "n": sampleSize,
    }
    :return: random sample of size n from src
    """
    file_path_param = request.args.get('src')
    if not file_path_param:
        return jsonify({
            "status": "error",
            "message": "No src provided in URL parameters"
        }), HTTPStatus.BAD_REQUEST

    n = request.args.get('n')
    if not n:
        return jsonify({
            "status": "error",
            "message": "No n provided in URL parameters"
        }), HTTPStatus.BAD_REQUEST

    file_path = "../" + file_path_param

    if not os.path.exists(file_path):
        return jsonify({
            "status": "error",
            "message": f"File not found at: {file_path}"
        }), HTTPStatus.NOT_FOUND

    try:
        basic_info = info.get_sample(file_path, int(n))
        return jsonify(basic_info), HTTPStatus.OK

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
