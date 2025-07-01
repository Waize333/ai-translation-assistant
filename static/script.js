/* filepath: /home/waize/GCD/projects/IBM_proj/translateAssistant/translator/static/script.js */
let lightMode = true;
let recorder = null;
let recording = false;
let voiceOption = "default";
let sourceLanguage = "en-US";
let targetLanguage = "Spanish";
const responses = [];
const botRepeatButtonIDToIndexMap = {};
const userRepeatButtonIDToRecordingMap = {};
const baseUrl = window.location.origin;

// Audio management to prevent double playback
let currentAudio = null;

// Language mapping for speech-to-text codes to full names
const languageMapping = {
  "en-US": "English",
  "es-ES": "Spanish", 
  "fr-FR": "French",
  "de-DE": "German",
  "ja-JP": "Japanese",
  "zh-CN": "Chinese",
  "pt-BR": "Portuguese",
  "it-IT": "Italian"
};

// Load available languages from server
const loadLanguages = async () => {
  try {
    const response = await fetch(baseUrl + "/languages");
    const languages = await response.json();
    
    // Populate source language dropdown
    const sourceSelect = $("#source-language");
    sourceSelect.empty();
    languages.sourceLanguages.forEach(lang => {
      sourceSelect.append(`<option value="${lang.code}">${lang.name}</option>`);
    });
    sourceSelect.val("en-US");
    
    // Populate target language dropdown
    const targetSelect = $("#target-language");
    targetSelect.empty();
    languages.targetLanguages.forEach(lang => {
      targetSelect.append(`<option value="${lang.code}">${lang.name}</option>`);
    });
    targetSelect.val("Spanish");
    
  } catch (error) {
    console.error("Error loading languages:", error);
  }
};

async function showBotLoadingAnimation() {
  await sleep(300);
  $(".bot-loading").show();
}

function hideBotLoadingAnimation() {
  $(".bot-loading").hide();
}

async function showUserLoadingAnimation() {
  await sleep(100);
  $(".user-loading").show();
}

function hideUserLoadingAnimation() {
  $(".user-loading").hide();
}

const getSpeechToText = async (userRecording) => {
  try {
    console.log('Sending audio for transcription...');
    
    let response = await fetch(baseUrl + "/speech-to-text", {
      method: "POST",
      headers: {
        'Source-Language': sourceLanguage,
        'Content-Type': userRecording.audioBlob.type || 'audio/webm'
      },
      body: userRecording.audioBlob,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Speech-to-text response:', responseData);
    return responseData.text || "Sorry, I couldn't understand what you said.";
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return "Sorry, there was an error processing your speech.";
  }
};

const processUserMessage = async (userMessage) => {
  try {
    let response = await fetch(baseUrl + "/process-message", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userMessage: userMessage, 
        voice: voiceOption,
        sourceLanguage: languageMapping[sourceLanguage] || "English",
        targetLanguage: targetLanguage
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Process message response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Process message error:', error);
    throw error;
  }
};

const cleanTextInput = (value) => {
  return value
    .trim()
    .replace(/[\n\t]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>&;]/g, "");
};

const recordAudio = () => {
  return new Promise(async (resolve) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];
      
      let mimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        bitsPerSecond: 128000
      });
      
      const audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      const start = () => {
        audioChunks.length = 0;
        mediaRecorder.start(1000);
      };

      const stop = () =>
        new Promise((resolve) => {
          mediaRecorder.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            const play = () => {
              if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
              }
              currentAudio = audio;
              audio.play();
            };
            
            resolve({ audioBlob, audioUrl, play });
          });

          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        });

      resolve({ start, stop });
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  });
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const toggleRecording = async () => {
  if (!recording) {
    recorder = await recordAudio();
    if (recorder) {
      recording = true;
      recorder.start();
      $("#send-button").addClass("recording");
      $("#send-button i").removeClass("fa-microphone").addClass("fa-stop");
    }
  } else {
    const audio = await recorder.stop();
    recording = false;
    $("#send-button").removeClass("recording");
    $("#send-button i").removeClass("fa-stop").addClass("fa-microphone");
    return audio;
  }
};

// Improved audio playback function
const playResponseAudio = (function () {
  const audioQueue = [];
  let isPlaying = false;

  const playNext = () => {
    if (audioQueue.length === 0) {
      isPlaying = false;
      return;
    }

    isPlaying = true;
    const audioSrc = audioQueue.shift();
    
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioSrc);
    currentAudio = audio;
    
    audio.addEventListener("ended", () => {
      playNext();
    });
    
    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      playNext();
    });

    audio.play().catch(e => {
      console.error("Audio play failed:", e);
      playNext();
    });
  };

  return function Sound(src) {
    if (isPlaying) {
      audioQueue.push(src);
    } else {
      audioQueue.push(src);
      playNext();
    }
  };
})();

const getRandomID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const scrollToBottom = () => {
  $("#chat-window").animate({
    scrollTop: $("#chat-window")[0].scrollHeight,
  }, 300);
};

const populateUserMessage = (userMessage, userRecording) => {
  $(".welcome-message").fadeOut(300);
  $("#message-input").val("");

  const messageId = getRandomID();
  
  if (userRecording) {
    userRepeatButtonIDToRecordingMap[messageId] = userRecording;
    hideUserLoadingAnimation();
    $("#message-list").append(
      `<div class='message user'>
        <div class='message-content'>
          ${userMessage}
          <div class='message-actions'>
            <button class='action-button' onclick='userRepeatButtonIDToRecordingMap["${messageId}"].play()' title='Replay recording'>
              <i class='fas fa-volume-up'></i>
            </button>
          </div>
        </div>
      </div>`
    );
  } else {
    $("#message-list").append(
      `<div class='message user'>
        <div class='message-content'>
          ${userMessage}
        </div>
      </div>`
    );
  }

  scrollToBottom();
};

const populateBotResponse = async (userMessage) => {
  await showBotLoadingAnimation();
  
  try {
    const response = await processUserMessage(userMessage);
    responses.push(response);

    const repeatButtonID = getRandomID();
    botRepeatButtonIDToIndexMap[repeatButtonID] = responses.length - 1;
    hideBotLoadingAnimation();
    
    $("#message-list").append(
      `<div class='message bot'>
        <div class='message-content'>
          ${response.watsonxResponseText}
          <div class='message-actions'>
            <button class='action-button' onclick='playResponseAudio("data:audio/wav;base64," + responses[botRepeatButtonIDToIndexMap["${repeatButtonID}"]].watsonxResponseSpeech)' title='Replay translation'>
              <i class='fas fa-volume-up'></i>
            </button>
          </div>
        </div>
      </div>`
    );

    playResponseAudio("data:audio/wav;base64," + response.watsonxResponseSpeech);
  } catch (error) {
    hideBotLoadingAnimation();
    $("#message-list").append(
      `<div class='message bot error'>
        <div class='message-content'>
          <i class='fas fa-exclamation-triangle'></i> Sorry, I encountered an error. Please try again.
        </div>
      </div>`
    );
    console.error("Error processing message:", error);
  }

  scrollToBottom();
};

$(document).ready(function () {
  // Load languages on page load
  loadLanguages();
  
  // Theme toggle
  $("#theme-toggle").click(function() {
    $("body").toggleClass("dark-mode");
    lightMode = !lightMode;
    
    const icon = $(this).find("i");
    if (lightMode) {
      icon.removeClass("fa-sun").addClass("fa-moon");
    } else {
      icon.removeClass("fa-moon").addClass("fa-sun");
    }
  });
  
  // Language swap
  $("#swap-languages").click(function() {
    const sourceVal = $("#source-language").val();
    const targetVal = $("#target-language").val();
    
    // Simple swap for demo - you might want more sophisticated logic
    $("#source-language").val(targetVal === "Spanish" ? "es-ES" : "en-US");
    $("#target-language").val(sourceVal === "en-US" ? "English" : "Spanish");
    
    sourceLanguage = $("#source-language").val();
    targetLanguage = $("#target-language").val();
  });
  
  // Enter key
  $("#message-input").keyup(function (event) {
    let inputVal = cleanTextInput($("#message-input").val());

    if (event.keyCode === 13 && inputVal != "") {
      populateUserMessage(inputVal, null);
      populateBotResponse(inputVal);
    }

    // Update send button icon
    if (inputVal == "" || inputVal == null) {
      $("#send-button i").removeClass("fa-paper-plane").addClass("fa-microphone");
    } else {
      $("#send-button i").removeClass("fa-microphone").addClass("fa-paper-plane");
    }
  });

  // Send button click
  $("#send-button").click(async function () {
    if ($("#send-button i").hasClass("fa-microphone") && !recording) {
      await toggleRecording();
    } else if (recording) {
      const userRecording = await toggleRecording();
      if (userRecording) {
        await showUserLoadingAnimation();
        const userMessage = await getSpeechToText(userRecording);
        populateUserMessage(userMessage, userRecording);
        populateBotResponse(userMessage);
      }
    } else {
      const message = cleanTextInput($("#message-input").val());
      if (message.trim()) {
        populateUserMessage(message, null);
        populateBotResponse(message);
        $("#send-button i").removeClass("fa-paper-plane").addClass("fa-microphone");
      }
    }
  });

  // Language change handlers
  $("#source-language").change(function () {
    sourceLanguage = $(this).val();
  });

  $("#target-language").change(function () {
    targetLanguage = $(this).val();
  });
});