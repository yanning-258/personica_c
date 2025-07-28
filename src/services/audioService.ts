import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';



interface AudioSettings {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording = false;
  private audioSettings: AudioSettings = {
    voice: 'en-US',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0
  };

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
    } catch (error: any) {
      console.error('Error starting recording:', error);
      this.isRecording = false;
      this.recording = null;
      throw new Error(`Failed to start recording: ${error.message || 'Unknown error'}`);
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording || !this.isRecording) {
      throw new Error('No active recording to stop');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      return uri;
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
      this.recording = null;
      throw new Error(`Failed to stop recording: ${error.message || 'Unknown error'}`);
    }
  }

  async playAudio(audioUri: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      this.sound = sound;
      await this.sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async speakText(text: string): Promise<void> {
    try {
      await Speech.speak(text, {
        voice: this.audioSettings.voice,
        rate: this.audioSettings.rate,
        pitch: this.audioSettings.pitch,
        volume: this.audioSettings.volume,
        language: 'en-US',
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      throw error;
    }
  }

  stopSpeaking(): void {
    Speech.stop();
  }

  updateAudioSettings(settings: Partial<AudioSettings>): void {
    this.audioSettings = { ...this.audioSettings, ...settings };
  }

  getAudioSettings(): AudioSettings {
    return { ...this.audioSettings };
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async cleanup(): Promise<void> {
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.isRecording = false;
  }

  // Real Speech-to-Text using AssemblyAI API
  async startSpeechToText(): Promise<void> {
    try {
      console.log('Starting real speech recording for AssemblyAI...');
      await this.startRecording();
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      throw new Error(`Failed to start speech recognition: ${error.message || 'Unknown error'}`);
    }
  }

  async stopSpeechToText(): Promise<string> {
    try {
      console.log('Stopping recording and sending to AssemblyAI...');
      
      // Get the audio file URI
      const audioUri = await this.stopRecording();
      
      if (!audioUri) {
        return "I couldn't capture any audio. Please try speaking again.";
      }

      // Convert audio to base64 for AssemblyAI API
      const base64Audio = await this.convertAudioToBase64(audioUri);
      
      // Send to AssemblyAI API for transcription
      const transcribedText = await this.transcribeWithAssemblyAI(base64Audio);
      
      console.log('AssemblyAI transcribed text:', transcribedText);
      return transcribedText;
      
    } catch (error: any) {
      console.error('Error in AssemblyAI speech recognition:', error);
      return "I'm having trouble understanding your voice right now. Could you please try speaking again?";
    }
  }

  private async convertAudioToBase64(audioUri: string): Promise<string> {
    try {
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return audioData;
    } catch (error: any) {
      console.error('Error converting audio to base64:', error);
      throw new Error(`Failed to process audio: ${error.message || 'Unknown error'}`);
    }
  }

  private async transcribeWithAssemblyAI(base64Audio: string): Promise<string> {
    try {
      console.log('Sending audio to AssemblyAI API...');
      
      // Step 1: Upload audio file to AssemblyAI
      const uploadResponse = await axios.post(
        `${ASSEMBLYAI_API_URL}/upload`,
        Buffer.from(base64Audio, 'base64'),
        {
          headers: {
            'Authorization': ASSEMBLYAI_API_KEY,
            'Content-Type': 'application/octet-stream'
          },
          timeout: 30000
        }
      );

      console.log('AssemblyAI upload response:', uploadResponse.data);
      const uploadUrl = uploadResponse.data.upload_url;

      if (!uploadUrl) {
        throw new Error('Failed to get upload URL from AssemblyAI');
      }

      // Step 2: Submit transcription request
      const transcriptResponse = await axios.post(
        `${ASSEMBLYAI_API_URL}/transcript`,
        {
          audio_url: uploadUrl,
          language_code: 'en',
          punctuate: true,
          format_text: true
        },
        {
          headers: {
            'Authorization': ASSEMBLYAI_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('AssemblyAI transcript response:', transcriptResponse.data);
      const transcriptId = transcriptResponse.data.id;

      if (!transcriptId) {
        throw new Error('Failed to get transcript ID from AssemblyAI');
      }

      // Step 3: Poll for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const statusResponse = await axios.get(
          `${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`,
          {
            headers: {
              'Authorization': ASSEMBLYAI_API_KEY
            },
            timeout: 10000
          }
        );

        console.log('AssemblyAI status response:', statusResponse.data);
        
        if (statusResponse.data.status === 'completed') {
          const transcribedText = statusResponse.data.text;
          if (transcribedText && transcribedText.trim()) {
            return transcribedText.trim();
          } else {
            return "I heard you speak, but couldn't make out the words clearly. Could you please repeat that?";
          }
        } else if (statusResponse.data.status === 'error') {
          throw new Error(`AssemblyAI transcription failed: ${statusResponse.data.error || 'Unknown error'}`);
        }
        
        attempts++;
      }
      
      // If we timeout, return a user-friendly message
      return "I'm taking a bit longer to process your voice. Could you please try speaking again?";
      
    } catch (error: any) {
      console.error('AssemblyAI API Error:', error);
      
      // Return user-friendly error message based on error type
      if (error.response?.status === 401) {
        return "I'm having trouble with my speech recognition service. Please check the API key.";
      } else if (error.response?.status === 429) {
        return "I'm getting too many requests right now. Let's take a short break and try again.";
      } else if (error.message?.includes('timeout')) {
        return "I'm taking longer than expected to process your voice. Please try again.";
      } else {
        return "I'm having trouble processing your voice right now. Let's try again!";
      }
    }
  }

  isCurrentlyListening(): boolean {
    return this.isRecording;
  }
}

export default new AudioService(); 