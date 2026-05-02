from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__)
CORS(app)  # Enables the React frontend to communicate with this backend

# Target the public directory
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), 'public')

@app.route('/api/datasets', methods=['GET'])
def list_datasets():
    try:
        if not os.path.exists(PUBLIC_DIR):
            return jsonify([]), 200
        # List all .json files in the public directory
        datasets = [f for f in os.listdir(PUBLIC_DIR) if f.endswith('.json')]
        return jsonify(datasets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/plies', methods=['GET'])
def get_plies():
    try:
        filename = request.args.get('file', 'plyData.json')
        # Security check: ensure the filename is valid and prevents directory traversal
        if not re.match(r'^[\w\-. ]+$', filename) or not filename.endswith('.json'):
            filename = 'plyData.json'
            
        data_file = os.path.join(PUBLIC_DIR, filename)
        
        if not os.path.exists(data_file):
            return jsonify([]), 200
            
        with open(data_file, 'r') as f:
            data = json.load(f)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/plies', methods=['POST'])
def save_plies():
    try:
        filename = request.args.get('file', 'plyData.json')
        if not re.match(r'^[\w\-. ]+$', filename) or not filename.endswith('.json'):
            filename = 'plyData.json'
            
        data_file = os.path.join(PUBLIC_DIR, filename)
        
        data = request.json
        data_str = json.dumps(data, indent=2)
        
        # Format the vertices array nicely on a single line
        formatted_str = re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', data_str)
        
        with open(data_file, 'w') as f:
            f.write(formatted_str)
            
        return jsonify({"message": "Successfully saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)