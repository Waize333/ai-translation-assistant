import base64
import json
from flask import Flask, render_template, request
from flask_cors import CORS
import os
from worker import speech_to_text, text_to_speech, watsonx_process_message

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/speech-to-text', methods=['POST'])
def speech_to_text_route():
    print("processing Speech-to-Text")
    audio_binary = request.data # Get the user's speech from their request
    
    # Get source language from request headers or default to English
    source_language = request.headers.get('Source-Language', 'en-US')
    
    text = speech_to_text(audio_binary, source_language) # Call speech_to_text function with language
    
    # Return the response to user in JSON format
    response = app.response_class(
        response=json.dumps({'text': text}),
        status=200,
        mimetype='application/json'
    )
    print(response)
    print(response.data)
    return response


@app.route('/process-message', methods=['POST'])
def process_message_route():
    user_message = request.json['userMessage'] # Get user's message from their request
    print('user_message', user_message)

    voice = request.json['voice'] # Get user's preferred voice from their request
    print('voice', voice)
    
    # Get language preferences from request
    source_language = request.json.get('sourceLanguage', 'English')
    target_language = request.json.get('targetLanguage', 'Spanish')
    print('source_language', source_language)
    print('target_language', target_language)

    # Call watsonx_process_message function with language parameters
    watsonx_response_text = watsonx_process_message(user_message, source_language, target_language)

    # Clean the response to remove any empty lines
    watsonx_response_text = os.linesep.join([s for s in watsonx_response_text.splitlines() if s])

    # Call our text_to_speech function to convert Watsonx Api's response to speech
    watsonx_response_speech = text_to_speech(watsonx_response_text, voice)

    # convert watsonx_response_speech to base64 string so it can be sent back in the JSON response
    watsonx_response_speech = base64.b64encode(watsonx_response_speech).decode('utf-8')

    # Send a JSON response back to the user containing their message's response both in text and speech formats
    response = app.response_class(
        response=json.dumps({
            "watsonxResponseText": watsonx_response_text, 
            "watsonxResponseSpeech": watsonx_response_speech,
            "sourceLanguage": source_language,
            "targetLanguage": target_language
        }),
        status=200,
        mimetype='application/json'
    )

    print(response)
    return response


# Add a new route to get available languages
@app.route('/languages', methods=['GET'])
def get_languages():
    languages = {
        "sourceLanguages": [
            {"code": "en-US", "name": "English (US)"},
            {"code": "es-ES", "name": "Spanish (Spain)"},
            {"code": "fr-FR", "name": "French (France)"},
            {"code": "de-DE", "name": "German (Germany)"},
            {"code": "ja-JP", "name": "Japanese (Japan)"},
            {"code": "zh-CN", "name": "Chinese (Mandarin)"},
            {"code": "pt-BR", "name": "Portuguese (Brazil)"},
            {"code": "it-IT", "name": "Italian (Italy)"}
        ],
        "targetLanguages": [
            {"code": "English", "name": "English"},
            {"code": "Spanish", "name": "Spanish"},
            {"code": "French", "name": "French"},
            {"code": "German", "name": "German"},
            {"code": "Japanese", "name": "Japanese"},
            {"code": "Chinese", "name": "Chinese"},
            {"code": "Portuguese", "name": "Portuguese"},
            {"code": "Italian", "name": "Italian"}
        ]
    }
    
    return app.response_class(
        response=json.dumps(languages),
        status=200,
        mimetype='application/json'
    )


if __name__ == "__main__":
    app.run(port=8000, host='0.0.0.0')
