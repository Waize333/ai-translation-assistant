# To call watsonx's LLM, we need to import the library of IBM Watson Machine Learning
from ibm_watson_machine_learning.foundation_models.utils.enums import ModelTypes
from ibm_watson_machine_learning.foundation_models import Model
import requests
from dotenv import load_dotenv
import os
import base64

load_dotenv()
# placeholder for Watsonx_API and Project_id incase you need to use the code outside this environment
# API_KEY = "Your WatsonX API"
PROJECT_ID= os.getenv("PROJECT_ID")

# Define the credentials 
credentials = {
    "url": "https://eu-de.ml.cloud.ibm.com",
    "apikey": os.getenv("API_KEY")
}
    
# Specify model_id that will be used for inferencing
model_id = ModelTypes.FLAN_UL2

# Define the model parameters
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from ibm_watson_machine_learning.foundation_models.utils.enums import DecodingMethods

parameters = {
    GenParams.DECODING_METHOD: DecodingMethods.GREEDY,
    GenParams.MIN_NEW_TOKENS: 1,
    GenParams.MAX_NEW_TOKENS: 1024
}

# Define the LLM
model = Model(
    model_id=model_id,
    params=parameters,
    credentials=credentials,
    project_id=PROJECT_ID
)

def debug_audio_info(audio_binary):
    print(f"Audio data length: {len(audio_binary)} bytes")
    print(f"Audio data type: {type(audio_binary)}")
    print(f"First 10 bytes: {audio_binary[:10] if len(audio_binary) >= 10 else audio_binary}")

def speech_to_text(audio_binary, source_language="en-US"):
    debug_audio_info(audio_binary)
    # Map language codes to Watson STT models
    language_models = {
        "en-US": "en-US_Multimedia",
        "es-ES": "es-ES_Multimedia", 
        "fr-FR": "fr-FR_Multimedia",
        "de-DE": "de-DE_Multimedia",
        "ja-JP": "ja-JP_Multimedia",
        "zh-CN": "zh-CN_Multimedia",
        "pt-BR": "pt-BR_Multimedia",
        "it-IT": "it-IT_Multimedia"
    }
    
    # Get the appropriate model or default to English
    model_name = language_models.get(source_language, "en-US_Multimedia")
    
    # Set up Watson Speech-to-Text HTTP Api url
    base_url = os.getenv("STT_BASE_URL", "https://api.au-syd.speech-to-text.watson.cloud.ibm.com")
    api_url = base_url + '/v1/recognize'
    
    # Set up parameters for our HTTP request
    params = {
        'model': model_name,
        'audio_metrics': 'false',
        'word_confidence': 'false',
        'timestamps': 'false'
    }
    
    # Set up headers - Try different content types
    headers = {
        'Content-Type': 'audio/webm',  # Changed from audio/wav
    }
    
    # Set up authentication
    auth = ('apikey', os.getenv("STT_API_KEY"))
    
    try:
        # Send a HTTP Post request
        response = requests.post(api_url, params=params, headers=headers, auth=auth, data=audio_binary)
        
        print(f'STT Request URL: {api_url}')
        print(f'STT Request params: {params}')
        print(f'STT Response status: {response.status_code}')
        
        # Check if request was successful
        if response.status_code == 200:
            response_json = response.json()
            print('Speech-to-Text response:', response_json)
            
            # Parse the response to get our transcribed text
            if response_json.get('results') and len(response_json['results']) > 0:
                if response_json['results'][0].get('alternatives') and len(response_json['results'][0]['alternatives']) > 0:
                    text = response_json['results'][0]['alternatives'][0].get('transcript', '').strip()
                    print('Recognised text:', text)
                    return text if text else "Sorry, I couldn't understand what you said."
            
            return "Sorry, no speech was detected. Please try speaking again."
        else:
            print(f'Speech-to-Text API error: {response.status_code}')
            print(f'Error response: {response.text}')
            
            # Try with different content type if first attempt fails
            if response.status_code == 400:
                return try_alternative_audio_format(audio_binary, api_url, params, auth, model_name)
            
            return "Sorry, there was an error processing your speech."
            
    except Exception as e:
        print(f'Speech-to-Text error: {str(e)}')
        return "Sorry, there was an error processing your speech."

def try_alternative_audio_format(audio_binary, api_url, params, auth, model_name):
    """Try different audio formats if the first one fails"""
    
    alternative_headers = [
        {'Content-Type': 'audio/flac'},
        {'Content-Type': 'audio/mp3'},
        {'Content-Type': 'audio/mpeg'},
        {'Content-Type': 'audio/ogg'},
        {'Content-Type': 'audio/wav'}
    ]
    
    for headers in alternative_headers:
        try:
            print(f'Trying alternative format: {headers["Content-Type"]}')
            response = requests.post(api_url, params=params, headers=headers, auth=auth, data=audio_binary)
            
            if response.status_code == 200:
                response_json = response.json()
                print(f'Success with {headers["Content-Type"]}:', response_json)
                
                if response_json.get('results') and len(response_json['results']) > 0:
                    if response_json['results'][0].get('alternatives') and len(response_json['results'][0]['alternatives']) > 0:
                        text = response_json['results'][0]['alternatives'][0].get('transcript', '').strip()
                        print('Recognised text:', text)
                        return text if text else "Sorry, I couldn't understand what you said."
                
                return "Sorry, no speech was detected. Please try speaking again."
            else:
                print(f'Failed with {headers["Content-Type"]}: {response.status_code}')
                
        except Exception as e:
            print(f'Error with {headers["Content-Type"]}: {str(e)}')
            continue
    
    return "Sorry, unable to process audio in any supported format."

def text_to_speech(text, voice=""):
    # Set up Watson Text-to-Speech HTTP Api url
    base_url = os.getenv("TTS_BASE_URL", "https://api.au-syd.text-to-speech.watson.cloud.ibm.com")
    api_url = base_url + '/v1/synthesize'

    # Adding voice parameter in api_url if the user has selected a preferred voice
    if voice != "" and voice != "default":
        api_url += "?voice=" + voice

    # Set the headers for our HTTP request
    headers = {
        'Accept': 'audio/wav',
        'Content-Type': 'application/json',
    }
    
    # Set up authentication
    auth = ('apikey', os.getenv("TTS_API_KEY"))

    # Set the body of our HTTP request
    json_data = {
        'text': text,
    }

    # Send a HTTP Post request to Watson Text-to-Speech Service
    response = requests.post(api_url, headers=headers, auth=auth, json=json_data)
    print('Text-to-Speech response:', response)
    return response.content

def watsonx_process_message(user_message, source_language="English", target_language="Spanish"):
    # Create a more flexible prompt based on selected languages
    prompt = f"""Translate this text from {source_language} to {target_language}. Only return the translation, nothing else.

{source_language}: {user_message}
{target_language}:"""
    
    response_text = model.generate_text(prompt=prompt)
    print("watsonx response:", response_text)
    
    # Clean the response
    response_text = response_text.strip()
    
    # Remove the original text if it's repeated
    if user_message in response_text:
        response_text = response_text.replace(user_message, "").strip()
    
    # Remove common separators (now dynamic based on languages)
    separators = [
        f"{target_language}:", 
        f"{source_language}:",
        "Translation:", 
        "Traducción:", 
        "Traduction:",
        "Übersetzung:",
        "翻译:",
        "翻訳:"
    ]
    
    for separator in separators:
        if separator in response_text:
            response_text = response_text.split(separator)[-1].strip()
    
    return response_text
