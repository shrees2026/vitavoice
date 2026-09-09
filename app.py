import os
from flask import Flask, request, send_file, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import io

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

RIME_API_KEY = os.environ.get('RIME_API_KEY')
RIME_URL = 'https://users.rime.ai/v1/rime-tts'
COVERAGE_URL = 'https://users.rime.ai/v1/coverage'


@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/api/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data.get('text')
    use_phonetics = data.get('usePhonetics', False)

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        rime_response = requests.post(
            RIME_URL,
            headers={
                'Authorization': f'Bearer {RIME_API_KEY}',
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg',
            },
            json={
                'speaker': 'peak',
                'text': text,
                'modelId': 'mistv2',
                'language': 'en',
                'phonemizeBetweenBrackets': bool(use_phonetics),
            }
        )

        if not rime_response.ok:
            print('Rime API error:', rime_response.text)
            return jsonify({'error': 'Rime API request failed', 'details': rime_response.text}), rime_response.status_code

        return Response(rime_response.content, mimetype='audio/mpeg')

    except Exception as e:
        print('Server error:', e)
        return jsonify({'error': 'Something went wrong generating audio'}), 500


@app.route('/api/coverage', methods=['POST'])
def coverage():
    data = request.get_json()
    text = data.get('text')

    try:
        coverage_response = requests.post(
            COVERAGE_URL,
            headers={
                'Authorization': f'Bearer {RIME_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={'text': text}
        )
        return jsonify(coverage_response.json())

    except Exception as e:
        print('Coverage check error:', e)
        return jsonify({'error': 'Coverage check failed'}), 500


if __name__ == '__main__':
    app.run(port=3000, debug=True)
