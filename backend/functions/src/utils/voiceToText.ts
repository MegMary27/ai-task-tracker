import axios from "axios";

const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;

export const getTranscriptionFromVoice = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    const response = await axios.post("https://api.deepgram.com/v1/listen", formData, {
      headers: {
        "Authorization": `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/wav",
      },
    });

    return response.data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error("Voice-to-text error:", error);
    return "";
  }
};
